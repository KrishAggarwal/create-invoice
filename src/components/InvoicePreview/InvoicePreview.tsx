import { forwardRef } from 'react';
import type { InvoiceData } from '../../types/invoice';
import UnifiedTemplate from '../templates/UnifiedTemplate';

interface Props {
  data: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        backgroundColor: '#ffffff',
      }}
    >
      <UnifiedTemplate data={data} />
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;
