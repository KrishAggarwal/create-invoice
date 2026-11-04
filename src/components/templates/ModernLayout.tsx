import { memo } from 'react';
import type { InvoiceData } from '../../types/invoice';
import { formatCurrency } from '../../types/invoice';
import { useInvoiceCalculations } from './shared/useInvoiceCalculations';

interface Props {
  data: InvoiceData;
}

function ModernLayout({ data }: Props) {
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
    accentColor,
  } = useInvoiceCalculations(data);

  const fontSizeVal = data.design?.fontSizePt ? `${data.design.fontSizePt}px` : '13px';
  const fontFamilyVal =
    data.design?.fontFamily === 'serif'
      ? "'Georgia', serif"
      : data.design?.fontFamily === 'mono'
      ? "'Courier New', monospace"
      : "'Inter', system-ui, -apple-system, sans-serif";

  const bannerBg = accentColor || '#0f172a';

  return (
    <div
      style={{
        fontFamily: fontFamilyVal,
        width: sheetWidth,
        minHeight: sheetMinHeight,
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontSize: fontSizeVal,
        lineHeight: '1.5',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Full-Bleed Modern Header Banner ── */}
      <div
        style={{
          backgroundColor: bannerBg,
          color: '#ffffff',
          padding: '20px 28px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: Brand Identity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {data.sender.logo && (
              <img
                src={data.sender.logo}
                alt="Logo"
                style={{
                  width: '36px',
                  height: '36px',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  padding: '2px',
                }}
              />
            )}
            <div>
              {data.sender.name && (
                <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff', lineHeight: '1.2' }}>
                  {data.sender.name}
                </div>
              )}
              {data.sender.title && (
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
                  {data.sender.title}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>
            {data.sender.email && <span>{data.sender.email}</span>}
            {data.sender.phone && <span>· {data.sender.phone}</span>}
            {data.sender.taxId && <span>· Tax ID: {data.sender.taxId}</span>}
          </div>
          {data.sender.address && (
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px', whiteSpace: 'pre-line' }}>
              {data.sender.address}
            </div>
          )}
        </div>

        {/* Right: Modern Document Badge & Pill */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 900,
              letterSpacing: '-0.5px',
              textTransform: 'uppercase',
              color: '#ffffff',
              lineHeight: '1.1',
              marginBottom: '4px',
            }}
          >
            {isPaidReceipt ? 'Receipt' : 'Invoice'}
          </div>
          {data.invoiceNumber && (
            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                padding: '3px 10px',
                borderRadius: '16px',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                marginBottom: '6px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              #{data.invoiceNumber}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end', fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>
            {data.invoiceDate && (
              <div>
                Date: <strong style={{ color: '#ffffff' }}>{formatDate(data.invoiceDate)}</strong>
              </div>
            )}
            {isPaidReceipt && receivedDate && (
              <div
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  marginTop: '2px',
                  fontSize: '10px',
                }}
              >
                RECEIVED {receivedDate}
              </div>
            )}
            {!isPaidReceipt && (data.dueDate || data.paymentDue?.dueDate) && (
              <div
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  marginTop: '2px',
                  fontSize: '10px',
                }}
              >
                DUE {formatDate(data.dueDate || data.paymentDue?.dueDate || '')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Body (Padding Applied Here) ── */}
      <div style={{ padding: paddingVal }}>
        {/* ── Two Floating Modern Cards (Client & Timeline) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          {/* Card 1: Client Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '10px 14px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: bannerBg,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '4px',
              }}
            >
              Billed To
            </div>
            {data.client.name && (
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '1px' }}>
                {data.client.name}
              </div>
            )}
            {data.client.companyName && (
              <div style={{ color: '#334155', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                {data.client.companyName}
              </div>
            )}
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.35' }}>
              {data.client.email && <div>{data.client.email}</div>}
              {data.client.phone && <div>{data.client.phone}</div>}
              {data.client.address && <div style={{ whiteSpace: 'pre-line' }}>{data.client.address}</div>}
              {data.client.taxId && <div>VAT / Tax ID: {data.client.taxId}</div>}
            </div>
          </div>

          {/* Card 2: Terms & Overview Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: bannerBg,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '6px',
                }}
              >
                {isPaidReceipt ? 'Settlement Info' : 'Invoice Terms'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                {isPaidReceipt ? (
                  data.paymentPaid?.paymentMethod ? (
                    <div>
                      <span style={{ color: '#64748b' }}>Payment Method: </span>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {data.paymentPaid.paymentMethod}
                      </div>
                    </div>
                  ) : null
                ) : (
                  <div>
                    <span style={{ color: '#64748b' }}>Payment Terms: </span>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {data.paymentDue?.paymentTerms || 'Upon Receipt'}
                    </div>
                  </div>
                )}
                {formattedPeriod && (
                  <div>
                    <span style={{ color: '#64748b' }}>Service Period: </span>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {formattedPeriod}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Payment Status:</span>
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: isPaidReceipt ? '#ecfdf5' : hasPartialPayments ? '#eff6ff' : '#fef3c7',
                  color: isPaidReceipt ? '#059669' : hasPartialPayments ? '#2563eb' : '#b45309',
                  border: `1px solid ${isPaidReceipt ? '#a7f3d0' : hasPartialPayments ? '#bfdbfe' : '#fde68a'}`,
                }}
              >
                {isPaidReceipt ? '✓ Fully Paid' : hasPartialPayments ? 'Partially Paid' : 'Payment Outstanding'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Line Items Table: Rounded Header Card Table with Zebra Striping ── */}
        {hasLineItems ? (
          <>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: bannerBg, color: '#ffffff' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                      }}
                    >
                      Description
                    </th>
                    {data.billingMode === 'hourly' && (
                      <>
                        <th
                          style={{
                            textAlign: 'center',
                            padding: '8px 10px',
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
                            padding: '8px 10px',
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
                        padding: '8px 12px',
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
                  {data.lineItems.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr
                        key={item.uuid || idx}
                        style={{
                          backgroundColor: isEven ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <td style={{ padding: '7px 12px' }}>
                          <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '13px' }}>{item.title}</div>
                          {item.subtitle && (
                            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                              {item.subtitle}
                            </div>
                          )}
                        </td>
                        {data.billingMode === 'hourly' && (
                          <>
                            <td style={{ textAlign: 'center', padding: '7px 10px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {item.hours && item.hours > 0 ? (
                                <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, display: 'inline-block', whiteSpace: 'nowrap' }}>
                                  {item.hours}
                                </span>
                              ) : '—'}
                            </td>
                            <td style={{ textAlign: 'right', padding: '7px 10px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {item.rate && item.rate > 0 ? formatCurrency(item.rate, data.currency) : '—'}
                            </td>
                          </>
                        )}
                        <td style={{ textAlign: 'right', padding: '7px 12px', color: '#0f172a', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>
                          {formatCurrency(item.amount, data.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Bottom Section: Two-Column Split (Payment Details Card + Dark Total Card) ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '14px',
                marginBottom: '14px',
              }}
            >
              {/* Left Column: Remittance Card */}
              {!isPaidReceipt && data.paymentDue?.account?.bankName ? (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 800, color: bannerBg, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    Direct Remittance Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', fontSize: '11px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Bank: </span>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{data.paymentDue.account.bankName}</div>
                    </div>
                    {data.paymentDue.account.accountNumber && (
                      <div>
                        <span style={{ color: '#64748b' }}>Account Number: </span>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                          {data.paymentDue.account.accountNumber}
                        </div>
                      </div>
                    )}
                    {data.paymentDue.account.routingOrIfsc && (
                      <div>
                        <span style={{ color: '#64748b' }}>Routing / IFSC: </span>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                          {data.paymentDue.account.routingOrIfsc}
                        </div>
                      </div>
                    )}
                    {data.paymentDue.account.swiftBic && (
                      <div>
                        <span style={{ color: '#64748b' }}>SWIFT / BIC: </span>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                          {data.paymentDue.account.swiftBic}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div />
              )}

              {/* Right Column: High-Impact Dark Highlight Total Card */}
              <div
                style={{
                  backgroundColor: bannerBg,
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }}
              >
                {subtotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, data.currency)}</span>
                  </div>
                )}
                {((data.discount ?? 0) > 0) && discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#fda4af', marginBottom: '4px' }}>
                    <span>Discount {data.discountType === 'percentage' && `(${data.discount}%)`}</span>
                    <span>-{formatCurrency(discountAmount, data.currency)}</span>
                  </div>
                )}
                {((data.taxRate ?? 0) > 0) && taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>
                    <span>Tax ({data.taxRate}%)</span>
                    <span>{formatCurrency(taxAmount, data.currency)}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
                    paddingTop: '8px',
                    marginTop: '6px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff' }}>
                    {formatCurrency(total, data.currency)}
                  </span>
                </div>

                {hasPartialPayments && paymentsTotal > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6ee7b7', marginTop: '4px' }}>
                      <span>Amount Paid</span>
                      <span>-{formatCurrency(paymentsTotal, data.currency)}</span>
                    </div>
                    {balanceDue > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          borderTop: '1px dashed rgba(255, 255, 255, 0.3)',
                          paddingTop: '6px',
                          marginTop: '4px',
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#fde047' }}>
                          Balance Due
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#fde047' }}>
                          {formatCurrency(balanceDue, data.currency)}
                        </span>
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
              color: '#94a3b8',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              margin: '18px 0',
              fontSize: '12px',
            }}
          >
            No line items added yet.
          </div>
        )}

        {/* ── Notes ── */}
        {data.notes && (
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '11px',
              color: '#475569',
              whiteSpace: 'pre-line',
              lineHeight: '1.45',
            }}
          >
            <strong style={{ color: '#0f172a' }}>Terms & Notes: </strong>
            {data.notes}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ModernLayout);

