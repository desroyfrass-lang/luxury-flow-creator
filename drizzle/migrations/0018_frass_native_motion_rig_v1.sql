-- FRASS Native Motion Rig v1: Frass-owned animation machine (browser runtime, like A1 Clean).
INSERT INTO public.studio_providers (slug, label, capabilities, status, enabled, engine_type, priority)
VALUES ('frass_motion_rig_v1', 'FRASS Native Motion Rig', ARRAY['animation'], 'available', true, 'frass_native', 1)
ON CONFLICT (slug) DO NOTHING;

CREATE POLICY "Members upload own studio motion" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'studio-motion' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Members read own studio motion" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'studio-motion' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.finalize_frass_native_motion_rig(
  _job_id uuid, _user_id uuid, _output_path text, _output_bytes bigint,
  _duration_seconds numeric, _width integer, _height integer, _source_asset text,
  _engine_slug text, _engine_version text, _processed_at timestamptz, _test_waiver boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','storage'
AS $function$
DECLARE j public.studio_generation_jobs%ROWTYPE; outp storage.objects%ROWTYPE; asset UUID; anim UUID; charge INTEGER; wallet_balance INTEGER; waived BOOLEAN;
BEGIN
  SELECT * INTO j FROM public.studio_generation_jobs WHERE id=_job_id AND created_by=_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'That Motion Rig job is not yours.'; END IF;
  IF j.engine_type <> 'frass_native' OR j.engine_slug <> 'frass_motion_rig_v1' OR _engine_slug <> j.engine_slug OR _engine_version <> '1.0.0' THEN RAISE EXCEPTION 'The machine identity does not match this job.'; END IF;
  IF j.charge_state IN ('charged','waived') THEN RETURN jsonb_build_object('charged',0,'replayed',true,'assetId',j.asset_id); END IF;
  IF j.status NOT IN ('queued','running') THEN RAISE EXCEPTION 'This job cannot accept an output.'; END IF;
  IF _processed_at IS NULL OR _processed_at > now() + interval '5 minutes' THEN RAISE EXCEPTION 'The processing timestamp is invalid.'; END IF;
  IF _output_path !~ ('^' || _user_id::text || '/' || _job_id::text || '/') THEN RAISE EXCEPTION 'The stored motion path is invalid.'; END IF;
  IF _duration_seconds IS NULL OR _duration_seconds < 2 OR _duration_seconds > 6 OR _width < 64 OR _height < 64 THEN RAISE EXCEPTION 'The motion did not pass the playback check.'; END IF;
  SELECT * INTO outp FROM storage.objects WHERE bucket_id='studio-motion' AND name=_output_path;
  IF outp.id IS NULL THEN RAISE EXCEPTION 'The motion file must exist in Studio storage.'; END IF;
  IF COALESCE((outp.metadata->>'size')::bigint,0)<>_output_bytes OR _output_bytes < 10000 THEN RAISE EXCEPTION 'Stored motion size verification failed.'; END IF;
  IF COALESCE(outp.metadata->>'mimetype','')<>'video/webm' THEN RAISE EXCEPTION 'Stored motion type verification failed.'; END IF;

  -- Waiver only for Founder/Admin commissioning tests; everyone else pays the normal verified charge.
  waived := COALESCE(_test_waiver,false) AND public.has_role(_user_id,'admin');
  charge := CASE WHEN waived THEN 0 ELSE round(COALESCE(j.estimated_cost_credits,0)) END;

  INSERT INTO public.studio_assets(name,asset_type,file_url,ownership,rights_status,source,generation_info,approved,reuse_allowed,tags,created_by)
  VALUES (CASE WHEN waived THEN 'TEST — Frassy idle breathing loop (disposable)' ELSE 'Motion Rig output' END,'animation',_output_path,'creator','creator_owned','frass_native',
    jsonb_build_object('job_id',_job_id,'bucket','studio-motion','engine_type','frass_native','engine_slug',_engine_slug,'engine_version',_engine_version,'processed_at',_processed_at,'source_asset',_source_asset,'duration_seconds',_duration_seconds,'width',_width,'height',_height,'test',waived),
    false,true,CASE WHEN waived THEN ARRAY['motion-rig','frass-native','test','disposable'] ELSE ARRAY['motion-rig','frass-native'] END,_user_id) RETURNING id INTO asset;

  INSERT INTO public.studio_animations(name,category,description,file_url,duration_seconds,loopable,tags,rights_status,reuse_allowed,approved,created_by)
  VALUES (CASE WHEN waived THEN 'TEST — Frassy idle breathing loop (disposable)' ELSE 'Frassy idle breathing loop' END,'idle',
    'Rendered by FRASS Native Motion Rig v1 from the approved image '||_source_asset||'. Not approved for live use.',
    _output_path,_duration_seconds,true,ARRAY['idle','breathing','motion-rig','frass-native'] || CASE WHEN waived THEN ARRAY['test','disposable'] ELSE ARRAY[]::text[] END,
    'frass_owned',true,false,_user_id) RETURNING id INTO anim;

  IF charge > 0 THEN
    INSERT INTO public.ai_credit_wallets(user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
    UPDATE public.ai_credit_wallets SET balance=balance-charge,lifetime_used=lifetime_used+charge,updated_at=now() WHERE user_id=_user_id AND balance>=charge RETURNING balance INTO wallet_balance;
    IF wallet_balance IS NULL THEN RAISE EXCEPTION 'Not enough credits to finish this job.'; END IF;
    INSERT INTO public.ai_credit_ledger(user_id,direction,amount,operation_key,label,description,metadata) VALUES (_user_id,'debit',charge,'ai-animation','FRASS Native Motion Rig','Verified output from '||_engine_slug,jsonb_build_object('job_id',_job_id,'idempotency_key','studio-job:'||_job_id));
  ELSE
    SELECT balance INTO wallet_balance FROM public.ai_credit_wallets WHERE user_id=_user_id;
  END IF;

  UPDATE public.studio_generation_jobs SET status='complete',asset_id=asset,verified_output_url=_output_path,verified_at=now(),completed_at=now(),actual_cost_credits=charge,
    charge_state=CASE WHEN waived THEN 'waived' ELSE 'charged' END,idempotency_key='studio-job:'||_job_id,
    output=jsonb_build_object('output_path',_output_path,'bucket','studio-motion','animation_id',anim,'engine_slug',_engine_slug,'engine_version',_engine_version,'processed_at',_processed_at,'duration_seconds',_duration_seconds,'test',waived),updated_at=now()
  WHERE id=_job_id AND charge_state='unbilled';
  IF NOT FOUND THEN RAISE EXCEPTION 'This job was already finalized.'; END IF;
  UPDATE public.studio_operations SET status='complete',verified=true,actual_credits=charge,output=jsonb_build_object('asset_id',asset,'animation_id',anim,'output_path',_output_path,'engine_slug',_engine_slug,'verified_at',now(),'waived',waived) WHERE job_id=_job_id;
  RETURN jsonb_build_object('charged',charge,'waived',waived,'replayed',false,'assetId',asset,'animationId',anim,'balance',wallet_balance,'verifiedAt',now());
END $function$;

REVOKE ALL ON FUNCTION public.finalize_frass_native_motion_rig(uuid,uuid,text,bigint,numeric,integer,integer,text,text,text,timestamptz,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_frass_native_motion_rig(uuid,uuid,text,bigint,numeric,integer,integer,text,text,text,timestamptz,boolean) TO service_role;