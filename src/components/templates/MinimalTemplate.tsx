import type { InvoiceData } from '../../types/invoice';
import {
  formatCurrency,
  calculateSubtotal,
  calculateDiscount,
  calculateTotal,
} from '../../types/invoice';

interface Props {
  data: InvoiceData;
}

/**
 * Minimal Template — Clean, lots of whitespace, thin lines, classic business invoice.
 * Uses inline styles for PDF rendering reliability.
 */
export default function MinimalTemplate({ data }: Props) {
  const subtotal = calculateSubtotal(data.lineItems);
  const discountAmount = calculateDiscount(
    subtotal,
    data.discount,
    data.discountType
  );
  const total = calculateTotal(subtotal, discountAmount);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isPaid = data.type === 'paid';

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        width: '210mm',
        padding: '28px 36px',
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontSize: '13px',
        lineHeight: '1.5',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
        }}
      >
        {/* Sender */}
        <div>
          {data.sender.logo && (
            <img
              src={data.sender.logo}
              alt="Logo"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                marginBottom: '12px',
                borderRadius: '6px',
              }}
            />
          )}
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#102a43',
              marginBottom: data.sender.title ? '2px' : '4px',
            }}
          >
            {data.sender.name || 'Your Name'}
          </div>
          {data.sender.title && (
            <div style={{ color: '#334e68', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
              {data.sender.title}
            </div>
          )}
          {data.sender.email && (
            <div style={{ color: '#627d98', fontSize: '12px' }}>
              {data.sender.email}
            </div>
          )}
          {data.sender.phone && (
            <div style={{ color: '#627d98', fontSize: '12px' }}>
              {data.sender.phone}
            </div>
          )}
          {data.sender.address && (
            <div
              style={{
                color: '#627d98',
                fontSize: '12px',
                whiteSpace: 'pre-line',
                marginTop: '4px',
              }}
            >
              {data.sender.address}
            </div>
          )}
        </div>

        {/* Invoice Info */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 300,
              color: '#334e68',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Invoice
          </div>
          <div style={{ color: '#627d98', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 500 }}>{data.invoiceNumber}</span>
          </div>
          <div style={{ color: '#627d98', fontSize: '12px', marginBottom: '4px' }}>
            Date: {formatDate(data.invoiceDate)}
          </div>
          {data.servicePeriod && (
            <div style={{ color: '#627d98', fontSize: '12px', marginBottom: '4px' }}>
              Period: {data.servicePeriod}
            </div>
          )}
          {!isPaid && data.paymentDue?.dueDate && (
            <div style={{ color: '#b45309', fontSize: '12px', fontWeight: 600 }}>
              Due: {formatDate(data.paymentDue.dueDate)}
            </div>
          )}
          {isPaid && data.paymentPaid?.paymentDate && (
            <div style={{ color: '#047857', fontSize: '12px', fontWeight: 600 }}>
              Paid: {formatDate(data.paymentPaid.paymentDate)}
            </div>
          )}
        </div>
      </div>


      {/* Bill To */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#9fb3c8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
          }}
        >
          Bill To
        </div>
        <div style={{ fontWeight: 600, color: '#243b53' }}>
          {data.client.name || 'Client Name'}
        </div>
        {data.client.companyName && (
          <div style={{ color: '#627d98', fontSize: '12px' }}>
            {data.client.companyName}
          </div>
        )}
        {data.client.email && (
          <div style={{ color: '#627d98', fontSize: '12px' }}>
            {data.client.email}
          </div>
        )}
        {data.client.address && (
          <div
            style={{
              color: '#627d98',
              fontSize: '12px',
              whiteSpace: 'pre-line',
              marginTop: '2px',
            }}
          >
            {data.client.address}
          </div>
        )}
      </div>

      {/* Line Items Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '16px',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 0',
                borderBottom: '2px solid #e2e8f0',
                fontSize: '10px',
                fontWeight: 600,
                color: '#9fb3c8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Description
            </th>
            <th
              style={{
                textAlign: 'center',
                padding: '10px 16px',
                borderBottom: '2px solid #e2e8f0',
                fontSize: '10px',
                fontWeight: 600,
                color: '#9fb3c8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                width: '80px',
              }}
            >
              Hours
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '10px 0',
                borderBottom: '2px solid #e2e8f0',
                fontSize: '10px',
                fontWeight: 600,
                color: '#9fb3c8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                width: '120px',
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item) => (
            <tr key={item.id}>
              <td
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ color: '#334e68', fontWeight: 500 }}>
                  {item.title || '—'}
                </div>
                {item.subtitle && (
                  <div style={{ color: '#9fb3c8', fontSize: '11px', marginTop: '2px' }}>
                    {item.subtitle}
                  </div>
                )}
              </td>
              <td
                style={{
                  textAlign: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  color: '#627d98',
                  verticalAlign: 'top',
                }}
              >
                {item.hours > 0 ? item.hours : '—'}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '12px 0',
                  borderBottom: '1px solid #f1f5f9',
                  color: '#243b53',
                  fontWeight: 500,
                  verticalAlign: 'top',
                }}
              >
                {formatCurrency(item.amount, data.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '24px',
        }}
      >
        <div style={{ width: '260px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              color: '#627d98',
              fontSize: '13px',
            }}
          >
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, data.currency)}</span>
          </div>

          {data.discount > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                color: '#627d98',
                fontSize: '13px',
              }}
            >
              <span>
                Discount
                {data.discountType === 'percentage'
                  ? ` (${data.discount}%)`
                  : ''}
              </span>
              <span>-{formatCurrency(discountAmount, data.currency)}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderTop: '2px solid #e2e8f0',
              marginTop: '8px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#102a43',
            }}
          >
            <span>{isPaid ? 'Total Paid' : 'Total Due'}</span>
            <span>{formatCurrency(total, data.currency)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 20px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                backgroundColor: isPaid ? '#ecfdf5' : '#fffbeb',
                color: isPaid ? '#047857' : '#b45309',
                border: `1px solid ${isPaid ? '#d1fae5' : '#fef3c7'}`,
              }}
            >
              {isPaid ? '✓ Paid' : '◷ Payment Due'}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      {!isPaid && data.paymentDue && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#9fb3c8',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}
          >
            Payment Details
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              fontSize: '12px',
            }}
          >
            {data.paymentDue.account.bankName && (
              <div>
                <span style={{ color: '#9fb3c8' }}>Bank: </span>
                <span style={{ color: '#334e68' }}>
                  {data.paymentDue.account.bankName}
                </span>
              </div>
            )}
            {data.paymentDue.account.accountNumber && (
              <div>
                <span style={{ color: '#9fb3c8' }}>Account: </span>
                <span style={{ color: '#334e68' }}>
                  {data.paymentDue.account.accountNumber}
                </span>
              </div>
            )}
            {data.paymentDue.account.routingOrIfsc && (
              <div>
                <span style={{ color: '#9fb3c8' }}>IFSC/Routing: </span>
                <span style={{ color: '#334e68' }}>
                  {data.paymentDue.account.routingOrIfsc}
                </span>
              </div>
            )}
            {data.paymentDue.account.upiId && (
              <div>
                <span style={{ color: '#9fb3c8' }}>UPI: </span>
                <span style={{ color: '#334e68' }}>
                  {data.paymentDue.account.upiId}
                </span>
              </div>
            )}
          </div>
          {data.paymentDue.paymentTerms && (
            <div
              style={{
                marginTop: '12px',
                fontSize: '12px',
                color: '#b45309',
                fontWeight: 500,
              }}
            >
              Terms: {data.paymentDue.paymentTerms}
            </div>
          )}
        </div>
      )}

      {isPaid && data.paymentPaid && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#ecfdf5',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #d1fae5',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#047857',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}
          >
            Payment Received
          </div>
          <div style={{ fontSize: '12px', color: '#334e68' }}>
            {data.paymentPaid.paymentMethod && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#9fb3c8' }}>Method: </span>
                {data.paymentPaid.paymentMethod}
              </div>
            )}
            {data.paymentPaid.transactionId && (
              <div>
                <span style={{ color: '#9fb3c8' }}>Reference: </span>
                {data.paymentPaid.transactionId}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              color: '#627d98',
              fontSize: '12px',
              whiteSpace: 'pre-line',
              lineHeight: '1.6',
            }}
          >
            {data.notes}
          </div>
        </div>
      )}
    </div>
  );
}
