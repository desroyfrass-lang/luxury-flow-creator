CREATE OR REPLACE FUNCTION public.finalize_frass_native_a1_clean(
  _job_id UUID, _user_id UUID, _source_path TEXT, _output_path TEXT,
  _source_mime TEXT, _output_mime TEXT, _source_bytes BIGINT, _output_bytes BIGINT,
  _engine_slug TEXT, _engine_version TEXT, _processed_at TIMESTAMPTZ
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage AS $$
DECLARE j public.studio_generation_jobs%ROWTYPE; src storage.objects%ROWTYPE; outp storage.objects%ROWTYPE; asset UUID; charge INTEGER; wallet_balance INTEGER;
BEGIN
  SELECT * INTO j FROM public.studio_generation_jobs WHERE id=_job_id AND created_by=_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'That A1 Clean job is not yours.'; END IF;
  IF j.engine_type <> 'frass_native' OR j.engine_slug <> 'frass_a1_clean_web_audio_v1' OR _engine_slug <> j.engine_slug OR _engine_version <> '1.0.0' THEN RAISE EXCEPTION 'The machine identity does not match this job.'; END IF;
  IF j.charge_state='charged' THEN RETURN jsonb_build_object('charged',0,'replayed',true,'assetId',j.asset_id); END IF;
  IF j.status NOT IN ('queued','running') THEN RAISE EXCEPTION 'This job cannot accept an output.'; END IF;
  IF _processed_at IS NULL OR _processed_at > now() + interval '5 minutes' THEN RAISE EXCEPTION 'The processing timestamp is invalid.'; END IF;
  IF _source_path !~ ('^' || _user_id::text || '/' || _job_id::text || '/') OR _output_path !~ ('^' || _user_id::text || '/' || _job_id::text || '/') OR _source_path=_output_path THEN RAISE EXCEPTION 'The stored audio paths are invalid.'; END IF;
  SELECT * INTO src FROM storage.objects WHERE bucket_id='studio-audio' AND name=_source_path;
  SELECT * INTO outp FROM storage.objects WHERE bucket_id='studio-audio' AND name=_output_path;
  IF src.id IS NULL OR outp.id IS NULL THEN RAISE EXCEPTION 'Both the source and processed output must exist.'; END IF;
  IF COALESCE((src.metadata->>'size')::bigint,0)<>_source_bytes OR COALESCE((outp.metadata->>'size')::bigint,0)<>_output_bytes OR _source_bytes<=0 OR _output_bytes<=44 THEN RAISE EXCEPTION 'Stored audio size verification failed.'; END IF;
  IF COALESCE(src.metadata->>'mimetype','')<>_source_mime OR COALESCE(outp.metadata->>'mimetype','')<>_output_mime OR _output_mime<>'audio/wav' THEN RAISE EXCEPTION 'Stored audio type verification failed.'; END IF;
  INSERT INTO public.studio_assets(name,asset_type,file_url,ownership,rights_status,source,generation_info,approved,reuse_allowed,tags,created_by)
  VALUES ('A1 Clean output','audio',_output_path,'creator','creator_owned','frass_native',jsonb_build_object('job_id',_job_id,'engine_type','frass_native','engine_slug',_engine_slug,'engine_version',_engine_version,'processed_at',_processed_at),true,true,ARRAY['a1-clean','frass-native'],_user_id) RETURNING id INTO asset;
  INSERT INTO public.studio_audio_versions(job_id,production_id,owner_id,version_kind,storage_path,mime_type,byte_size) VALUES (_job_id,j.production_id,_user_id,'source',_source_path,_source_mime,_source_bytes);
  INSERT INTO public.studio_audio_versions(job_id,production_id,owner_id,version_kind,storage_path,mime_type,byte_size,engine_type,engine_slug,engine_version,processed_at) VALUES (_job_id,j.production_id,_user_id,'a1_clean',_output_path,_output_mime,_output_bytes,'frass_native',_engine_slug,_engine_version,_processed_at);
  charge := round(COALESCE(j.estimated_cost_credits,0));
  INSERT INTO public.ai_credit_wallets(user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.ai_credit_wallets SET balance=balance-charge,lifetime_used=lifetime_used+charge,updated_at=now() WHERE user_id=_user_id AND balance>=charge RETURNING balance INTO wallet_balance;
  IF wallet_balance IS NULL THEN RAISE EXCEPTION 'Not enough credits to finish this job.'; END IF;
  UPDATE public.studio_generation_jobs SET status='complete',asset_id=asset,verified_output_url=_output_path,verified_at=now(),completed_at=now(),actual_cost_credits=charge,charge_state='charged',idempotency_key='studio-job:'||_job_id,output=jsonb_build_object('source_path',_source_path,'output_path',_output_path,'engine_slug',_engine_slug,'engine_version',_engine_version,'processed_at',_processed_at),updated_at=now() WHERE id=_job_id AND charge_state='unbilled';
  IF NOT FOUND THEN RAISE EXCEPTION 'This job was already finalized.'; END IF;
  INSERT INTO public.ai_credit_ledger(user_id,direction,amount,operation_key,label,description,metadata) VALUES (_user_id,'debit',charge,'voice-enhance','FRASS Native A1 Clean','Verified output from '||_engine_slug,jsonb_build_object('job_id',_job_id,'idempotency_key','studio-job:'||_job_id));
  UPDATE public.studio_operations SET status='complete',verified=true,actual_credits=charge,output=jsonb_build_object('asset_id',asset,'output_path',_output_path,'engine_slug',_engine_slug,'verified_at',now()) WHERE job_id=_job_id;
  INSERT INTO public.studio_a1_evidence(production_id,check_id,state,note,job_id,asset_id,machine_slug,verified_at,created_by) VALUES (j.production_id,'source','passed','Original source preserved in private Studio storage.',_job_id,asset,_engine_slug,now(),_user_id) ON CONFLICT(production_id,check_id) DO UPDATE SET state='passed',note=EXCLUDED.note,job_id=EXCLUDED.job_id,asset_id=EXCLUDED.asset_id,machine_slug=EXCLUDED.machine_slug,verified_at=EXCLUDED.verified_at,updated_at=now();
  INSERT INTO public.studio_a1_evidence(production_id,check_id,state,note,job_id,asset_id,machine_slug,verified_at,created_by) VALUES (j.production_id,'input-clean','passed','Deterministic rumble cut, band-limit, compression and peak normalization completed.',_job_id,asset,_engine_slug,now(),_user_id) ON CONFLICT(production_id,check_id) DO UPDATE SET state='passed',note=EXCLUDED.note,job_id=EXCLUDED.job_id,asset_id=EXCLUDED.asset_id,machine_slug=EXCLUDED.machine_slug,verified_at=EXCLUDED.verified_at,updated_at=now();
  RETURN jsonb_build_object('charged',charge,'replayed',false,'assetId',asset,'balance',wallet_balance,'verifiedAt',now());
END $$;
REVOKE ALL ON FUNCTION public.finalize_frass_native_a1_clean(UUID,UUID,TEXT,TEXT,TEXT,TEXT,BIGINT,BIGINT,TEXT,TEXT,TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_frass_native_a1_clean(UUID,UUID,TEXT,TEXT,TEXT,TEXT,BIGINT,BIGINT,TEXT,TEXT,TIMESTAMPTZ) TO service_role;