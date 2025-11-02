import React from "react";

const QuotationResultPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#f8f7f6] dark:bg-[#221810] text-[#333333] dark:text-[#f8f7f6]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#E6E0DB] dark:border-[#443a32] px-4 sm:px-10 lg:px-20 py-4 bg-white dark:bg-[#221810]">
        <div className="flex items-center gap-4">
          <div className="text-[#E85D04] size-7">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/></svg>
          </div>
          <h2 className="text-lg font-bold tracking-[-0.015em]">Craft Connect</h2>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <a className="text-sm font-medium">Dashboard</a>
            <a className="text-sm font-medium">Products</a>
            <a className="text-sm font-bold text-[#E85D04]">Quotations</a>
          </div>
          <div className="flex items-center gap-2">
            <button className="size-10 rounded-lg bg-[#f8f7f6] dark:bg-[#221810]/50 flex items-center justify-center"><span className="material-symbols-outlined">notifications</span></button>
            <button className="size-10 rounded-lg bg-[#f8f7f6] dark:bg-[#221810]/50 flex items-center justify-center"><span className="material-symbols-outlined">settings</span></button>
            <div className="size-10 rounded-full bg-cover bg-center" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuDl5v6DncWSCQ0ZH5fgJYBDuTOBPBekLhJZNBqkiljWvl6He7JKbL77VHbeBUBI5la2njbyFStRzQRg_AASfgjm2a5LmRfXqcvk5FkRbYpzyLlehjEaaXpzjP6ulj6SEW2cZJUBSRI42VhZIeQWLP1D3wKfQiMGc2_nyIGOrj3STEx6B5FZ9Nzua6lj7FqOS87FZSa00e2NiugpeoInL6Th2IJvDNTzqutDmiU3U1pdJTmVebbl5l36PvH91MqQKfr9bS4BbdMwPJ8')"}} />
          </div>
        </div>
        <button className="md:hidden size-10 rounded-lg bg-[#f8f7f6] dark:bg-[#221810]/50 flex items-center justify-center"><span className="material-symbols-outlined">menu</span></button>
      </header>

      {/* Main */}
      <main className="px-4 sm:px-6 md:px-10 lg:px-20 py-8 flex flex-1 justify-center items-center">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-[-0.033em]">AI Suggested Quotation</h1>
            <p className="mt-2 text-[#333333]/80 dark:text-[#f8f7f6]/80">Here is the AI-generated pricing for your product. You can adjust, finalize, and send it directly to your client.</p>
          </div>

          <div className="bg-white dark:bg-[#221810]/80 p-6 sm:p-8 rounded-xl shadow-lg border border-[#E6E0DB]/50 dark:border-[#443a32]/50 flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-[-0.015em]">Hand-Carved Wooden Bowl</h2>
              <p className="mt-1 text-[#333333]/80 dark:text-[#f8f7f6]/80 max-w-prose mx-auto">AI-Generated Description: A unique, one-of-a-kind decorative bowl, meticulously hand-carved from sustainable mango wood, perfect for adding a touch of rustic elegance to any home.</p>
            </div>

            <div className="rounded-lg p-6 text-center bg-[#FFF8F0] dark:bg-[#E85D04]/10">
              <p className="text-sm font-medium uppercase tracking-wider text-[#333333]/70 dark:text-[#f8f7f6]/70">Final Suggested Price</p>
              <p className="mt-2 text-6xl sm:text-7xl font-extrabold text-[#E85D04] leading-none">₹4,250</p>
            </div>

            <div>
              <h3 className="text-lg font-bold tracking-[-0.015em] pb-4 border-b border-[#E6E0DB] dark:border-[#443a32]">Detailed Breakdown</h3>
              <div className="pt-4 space-y-4">
                {[{icon:'architecture',label:'Base Price',value:'₹3,000'},{icon:'percent',label:'Taxes / GST (18%)',value:'₹540'},{icon:'inventory_2',label:'Packaging & Materials Fee',value:'₹160'},{icon:'schedule',label:'Estimated Labor Cost',value:'₹550'}].map((i)=> (
                  <div key={i.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-[#333333]/60 dark:text-[#f8f7f6]/60">{i.icon}</span>
                      <p className="font-medium">{i.label}</p>
                    </div>
                    <p className="text-lg font-bold">{i.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6E0DB] dark:border-[#443a32] flex flex-col sm:flex-row gap-3">
              <button className="w-full sm:w-auto flex-1 h-12 px-6 rounded-lg font-bold bg-[#f8f7f6] dark:bg-[#221810] border-2 border-[#E6E0DB] dark:border-[#443a32] text-[#333333] dark:text-[#f8f7f6] hover:bg-[#E6E0DB]/40 dark:hover:bg-[#443a32]/40 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl">edit</span>
                Adjust Price Manually
              </button>
              <button className="w-full sm:w-auto h-12 px-6 rounded-lg font-bold border-2 border-[#E85D04] text-[#E85D04] hover:bg-[#E85D04]/10 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                Generate Invoice/PDF
              </button>
              <button className="w-full sm:w-auto h-12 px-6 rounded-lg font-bold bg-[#E85D04] text-white hover:scale-105 shadow-md hover:shadow-lg transition-transform flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="bi bi-whatsapp"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943s-.182-.133-.38-.232"/></svg>
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuotationResultPage;
