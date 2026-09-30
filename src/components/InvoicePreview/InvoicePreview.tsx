import { forwardRef } from 'react';
import type { InvoiceData } from '../../types/invoice';
import MinimalTemplate from '../templates/MinimalTemplate';
import ModernTemplate from '../templates/ModernTemplate';

interface Props {
  data: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        // The outer wrapper needs no extra styles - the template handles everything
        backgroundColor: '#ffffff',
      }}
    >
      {data.template === 'minimal' ? (
        <MinimalTemplate data={data} />
      ) : (
        <ModernTemplate data={data} />
      )}
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;
