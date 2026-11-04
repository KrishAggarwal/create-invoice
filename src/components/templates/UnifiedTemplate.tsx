import { memo } from 'react';
import type { InvoiceData } from '../../types/invoice';
import MinimalLayout from './MinimalLayout';
import ModernLayout from './ModernLayout';
import ExecutiveLayout from './ExecutiveLayout';

interface Props {
  data: InvoiceData;
}

function UnifiedTemplate({ data }: Props) {
  switch (data.template) {
    case 'modern':
      return <ModernLayout data={data} />;
    case 'executive':
      return <ExecutiveLayout data={data} />;
    case 'minimal':
    default:
      return <MinimalLayout data={data} />;
  }
}

export default memo(UnifiedTemplate);
