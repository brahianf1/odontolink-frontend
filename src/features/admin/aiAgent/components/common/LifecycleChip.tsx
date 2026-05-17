import { Chip } from '@mui/material';
import type { AiAgentLifecycle } from '../../../../../types/aiAgent.types';
import { lifecycleMeta } from '../../utils/lifecycle';

interface LifecycleChipProps {
  lifecycle: AiAgentLifecycle;
  size?: 'small' | 'medium';
}

export default function LifecycleChip({ lifecycle, size = 'small' }: LifecycleChipProps) {
  const meta = lifecycleMeta(lifecycle);
  return <Chip label={meta.label} color={meta.color} size={size} variant="filled" />;
}
