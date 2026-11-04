import { memo } from 'react';
import type { InvoiceData } from '../../types/invoice';
import { formatCurrency } from '../../types/invoice';
import { useInvoiceCalculations } from './shared/useInvoiceCalculations';

interface Props {
  data: InvoiceData;
}

function ExecutiveLayout({ data }: Props) {
  const {
    subtotal,
    discountAmount,
    taxAmount,
    total,
    paymentsTotal,
    isPaidReceipt,
    hasPartialPayments,
    balanceDue,
    hasLineItems,
    formatDate,
    formattedPeriod,
    receivedDate,
    sheetWidth,
    sheetMinHeight,
    paddingVal,
  } = useInvoiceCalculations(data);

  const fontSizeVal = data.design?.fontSizePt ? `${data.design.fontSizePt}px` : '13px';
  // Executive defaults to classic Serif (Georgia / Times) unless explicitly overridden
  const fontFamilyVal =
    data.design?.fontFamily === 'sans'
      ? "'Inter', system-ui, -apple-system, sans-serif"
      : data.design?.fontFamily === 'mono'
      ? "'Courier New', monospace"
      : "'Georgia', 'Times New Roman', serif";

  return (
    <div
      style={{
        fontFamily: fontFamilyVal,
        width: sheetWidth,
        minHeight: sheetMinHeight,
        padding: paddingVal,
        backgroundColor: '#ffffff',
        color: '#1c1917',
        fontSize: fontSizeVal,
        lineHeight: '1.6',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top Formal Corporate Crest & Double Horizontal Rules ── */}
      <div
        style={{
          borderTop: '3px solid #1c1917',
          borderBottom: '1px solid #1c1917',
          padding: '12px 0 10px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: Formal Letterhead Crest (SENDER SHOWN ONCE) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            {data.sender.logo && (
              <img
                src={data.sender.logo}
                alt="Logo"
                style={{
                  width: '36px',
                  height: '36px',
                  objectFit: 'contain',
                }}
              />
            )}
            <div>
              {data.sender.name && (
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.2px', lineHeight: '1.2' }}>
                  {data.sender.name}
                </div>
              )}
              {data.sender.title && (
                <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#57534e' }}>
                  {data.sender.title}
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#78716c', lineHeight: '1.35' }}>
            {data.sender.address && <div style={{ whiteSpace: 'pre-line' }}>{data.sender.address}</div>}
            <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
              {data.sender.email && <span>{data.sender.email}</span>}
              {data.sender.phone && <span>· {data.sender.phone}</span>}
              {data.sender.taxId && <span>· Tax ID: {data.sender.taxId}</span>}
            </div>
          </div>
        </div>

        {/* Right: Formal Statement of Invoice Title */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: isPaidReceipt ? '#15803d' : '#1c1917',
              marginBottom: '3px',
            }}
          >
            {isPaidReceipt ? 'Official Receipt' : 'Statement of Invoice'}
          </div>
          <div style={{ fontSize: '10px', color: '#78716c', letterSpacing: '0.5px' }}>
            Corporate Accounting Record
          </div>
        </div>
      </div>

      {/* ── Structured Corporate Requisition Frame (Enclosed Box - ZERO DUPLICATION) ── */}
      <div
        style={{
          border: '1px solid #78716c',
          marginBottom: '14px',
        }}
      >
        {/* Top Split: Client Billed vs Engagement Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
          {/* Left: Billed Client */}
          <div style={{ padding: '8px 12px', borderRight: '1px solid #d6d3d1' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
              Account Billed (Client Entity)
            </div>
            {data.client.companyName ? (
              <>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1c1917' }}>
                  {data.client.companyName}
                </div>
                {data.client.name && (
                  <div style={{ fontSize: '11px', color: '#44403c', marginTop: '1px' }}>
                    Attn: {data.client.name}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#1c1917' }}>
                {data.client.name || 'Client Contact'}
              </div>
            )}
            <div style={{ fontSize: '11px', color: '#57534e', marginTop: '2px', lineHeight: '1.35' }}>
              {data.client.address && <div style={{ whiteSpace: 'pre-line' }}>{data.client.address}</div>}
              {data.client.email && <div>{data.client.email}</div>}
              {data.client.phone && <div>{data.client.phone}</div>}
              {data.client.taxId && <div>Tax ID / VAT: {data.client.taxId}</div>}
            </div>
          </div>

          {/* Right: Engagement Period & Status */}
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
                Engagement Scope
              </div>
              {formattedPeriod ? (
                <div>
                  <div style={{ fontSize: '10px', color: '#78716c' }}>Service Period:</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#1c1917' }}>{formattedPeriod}</div>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#78716c' }}>
                  Professional services rendered as itemized below.
                </div>
              )}
            </div>

            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  backgroundColor: isPaidReceipt ? '#ecfdf5' : hasPartialPayments ? '#eff6ff' : '#fffbeb',
                  color: isPaidReceipt ? '#15803d' : hasPartialPayments ? '#1d4ed8' : '#b45309',
                  border: `1px solid ${isPaidReceipt ? '#a7f3d0' : hasPartialPayments ? '#bfdbfe' : '#fde68a'}`,
                }}
              >
                {isPaidReceipt ? 'Status: Paid' : hasPartialPayments ? 'Status: Partial' : 'Status: Due Upon Terms'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Metadata Requisition Row (EXACTLY ONCE) */}
        <div
          style={{
            borderTop: '1px solid #d6d3d1',
            backgroundColor: '#fafaf9',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            fontSize: '11px',
          }}
        >
          <div style={{ padding: '6px 10px', borderRight: '1px solid #e7e5e4' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#78716c', textTransform: 'uppercase' }}>
              {isPaidReceipt ? 'Receipt No' : 'Invoice No'}
            </div>
            <div style={{ fontWeight: 700, color: '#1c1917', fontFamily: 'monospace' }}>#{data.invoiceNumber}</div>
          </div>
          <div style={{ padding: '6px 10px', borderRight: '1px solid #e7e5e4' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#78716c', textTransform: 'uppercase' }}>Date Issued</div>
            <div style={{ fontWeight: 600, color: '#1c1917' }}>{formatDate(data.invoiceDate)}</div>
          </div>
          <div style={{ padding: '6px 10px', borderRight: '1px solid #e7e5e4' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#78716c', textTransform: 'uppercase' }}>
              {isPaidReceipt ? 'Payment Method' : 'Payment Terms'}
            </div>
            <div style={{ fontWeight: 600, color: '#1c1917' }}>
              {isPaidReceipt ? (data.paymentPaid?.paymentMethod || 'Direct Settlement') : (data.paymentDue?.paymentTerms || 'Net 15')}
            </div>
          </div>
          <div style={{ padding: '6px 10px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: isPaidReceipt ? '#15803d' : '#78716c', textTransform: 'uppercase' }}>
              {isPaidReceipt ? 'Payment Received' : 'Payment Due'}
            </div>
            <div style={{ fontWeight: 700, color: isPaidReceipt ? '#15803d' : '#b45309' }}>
              {isPaidReceipt ? (receivedDate || formatDate(data.invoiceDate)) : (formatDate(data.dueDate || data.paymentDue?.dueDate || '') || 'Upon Receipt')}
            </div>
          </div>
        </div>
      </div>

      {/* ── Line Items: Formal Ledger Table (Clean Horizontal Rules, No Cage Borders) ── */}
      {hasLineItems ? (
        <>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              borderTop: '2px solid #1c1917',
              borderBottom: '2px solid #1c1917',
              marginBottom: '14px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#1c1917', color: '#ffffff' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '7px 10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  Description of Professional Services / Deliverables
                </th>
                {data.billingMode === 'hourly' && (
                  <>
                    <th
                      style={{
                        textAlign: 'center',
                        padding: '7px 10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        width: '80px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Hours
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '7px 10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        width: '100px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Rate
                    </th>
                  </>
                )}
                <th
                  style={{
                    textAlign: 'right',
                    padding: '7px 10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    width: '120px',
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, idx) => (
                <tr
                  key={item.uuid || idx}
                  style={{
                    borderBottom: '1px solid #e7e5e4',
                    backgroundColor: idx % 2 === 1 ? '#fafaf9' : '#ffffff',
                  }}
                >
                  <td style={{ padding: '7px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#1c1917', fontSize: '13px' }}>{item.title}</div>
                    {item.subtitle && (
                      <div style={{ color: '#78716c', fontSize: '11px', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                        {item.subtitle}
                      </div>
                    )}
                  </td>
                  {data.billingMode === 'hourly' && (
                    <>
                      <td style={{ textAlign: 'center', padding: '7px 10px', color: '#57534e', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {item.hours && item.hours > 0 ? item.hours : '—'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '7px 10px', color: '#57534e', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {item.rate && item.rate > 0 ? formatCurrency(item.rate, data.currency) : '—'}
                      </td>
                    </>
                  )}
                  <td style={{ textAlign: 'right', padding: '7px 10px', fontWeight: 700, color: '#1c1917', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {formatCurrency(item.amount, data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Financial Totals: Classic Accounting Summary with Double Underline ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <div style={{ width: '270px' }}>
              {subtotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', color: '#57534e' }}>
                  <span>Gross Subtotal</span>
                  <span style={{ color: '#1c1917' }}>{formatCurrency(subtotal, data.currency)}</span>
                </div>
              )}
              {((data.discount ?? 0) > 0) && discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', color: '#57534e' }}>
                  <span>Contract Discount {data.discountType === 'percentage' && `(${data.discount}%)`}</span>
                  <span style={{ color: '#b91c1c' }}>-{formatCurrency(discountAmount, data.currency)}</span>
                </div>
              )}
              {((data.taxRate ?? 0) > 0) && taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', color: '#57534e' }}>
                  <span>Statutory Tax ({data.taxRate}%)</span>
                  <span style={{ color: '#1c1917' }}>{formatCurrency(taxAmount, data.currency)}</span>
                </div>
              )}

              {/* Total Row with Traditional Accounting Double Underline */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderTop: '1px solid #1c1917',
                  borderBottom: '3px double #1c1917',
                  marginTop: '4px',
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#1c1917',
                }}
              >
                <span>Total Amount Due</span>
                <span>{formatCurrency(total, data.currency)}</span>
              </div>

              {hasPartialPayments && paymentsTotal > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                    <span>Credits / Paid to Date</span>
                    <span>-{formatCurrency(paymentsTotal, data.currency)}</span>
                  </div>
                  {balanceDue > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderTop: '1px solid #1c1917',
                        borderBottom: '3px double #1c1917',
                        marginTop: '3px',
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#b45309',
                      }}
                    >
                      <span>Remaining Balance Due</span>
                      <span>{formatCurrency(balanceDue, data.currency)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: '#78716c',
            border: '1px dashed #a8a29e',
            margin: '18px 0',
            fontSize: '12px',
          }}
        >
          No deliverable line items on file.
        </div>
      )}

      {/* ── Remittance Advice & Instructions ── */}
      <div
        style={{
          borderTop: '1px dashed #78716c',
          paddingTop: '10px',
          marginTop: 'auto',
        }}
      >
        <div style={{ fontSize: '9px', fontWeight: 700, color: '#1c1917', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
          Remittance Advice & Instructions
        </div>
        <div style={{ fontSize: '11px', color: '#57534e', lineHeight: '1.4' }}>
          {!isPaidReceipt && data.paymentDue?.account?.bankName ? (
            <>
              Please remit payments directly to: <strong style={{ color: '#1c1917' }}>{data.paymentDue.account.bankName}</strong>.
              {data.paymentDue.account.accountNumber && (
                <span> Account: <strong style={{ color: '#1c1917' }}>{data.paymentDue.account.accountNumber}</strong></span>
              )}
              {data.paymentDue.account.routingOrIfsc && (
                <span> · Routing / Swift: <strong style={{ color: '#1c1917' }}>{data.paymentDue.account.routingOrIfsc}</strong></span>
              )}
            </>
          ) : (
            <div>Payment received in full. Thank you for your business.</div>
          )}
          {data.notes && (
            <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#78716c' }}>
              Note: {data.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ExecutiveLayout);
