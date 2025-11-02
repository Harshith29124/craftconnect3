import React from "react";

const ArtisanHubPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f8f7f6] text-[#181411] dark:bg-[#221810] dark:text-white overflow-x-hidden">
      {/* Top Nav */}
      <header className="flex items-center justify-between border-b border-[#e6e0db] dark:border-[#3a2d21] px-4 sm:px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="size-6 text-[#ec6d13]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/></svg>
          </div>
          <h2 className="text-lg font-bold tracking-[-0.015em]">Craft Connect</h2>
        </div>
        <div className="flex flex-1 justify-end gap-2 sm:gap-4 md:gap-8">
          <div className="hidden md:flex md:gap-9 items-center">
            <a className="text-sm font-medium text-[#181411] dark:text-gray-300" href="#">Home</a>
            <a className="text-sm font-medium text-[#ec6d13]" href="#">Hub</a>
            <a className="text-sm font-medium text-[#181411] dark:text-gray-300" href="#">Messages</a>
            <a className="text-sm font-medium text-[#181411] dark:text-gray-300" href="#">Account</a>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4f2f0] text-[#181411] dark:bg-[#221810]/50 dark:text-white"><span className="material-symbols-outlined text-xl">notifications</span></button>
          <div className="size-10 rounded-full bg-cover bg-center" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuCVBjXjipHZ-6IumnklMpka3WafA4sNRLwwZzUADBwVXjbwODh9Wh6hbrDXiKvIbw0p6JAcO7KwmsZHPNgz1ZilesxbmSDUzKIZl13kivszRjwJ85Aap4ehm12rylXKrfa6Vak4EltXoQlOOEF_3sFOrtiRYCJP4caCHLzqQCO3bbXNARHadr7UEojhDa9zwwxQN92OD_TAw9d-8UDkI3G18t_DKFXHZQ3SbxOTrDEN2SztMBOrwShLzUZRvTSVzIH0U5X6DLC0e3M')"}} />
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 justify-center py-5 sm:py-8 md:py-10">
        <div className="w-full max-w-5xl px-4 sm:px-6">
          {/* Profile header */}
          <div className="p-4">
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex gap-4 items-center">
                <div className="rounded-full min-h-24 w-24 sm:min-h-32 sm:w-32 bg-cover bg-center" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuCSQ_XfCaQkmHbqwxEMXIJ5z0r7YIZDyN20mP9fQxC93saLXhalHqXWDsGEY30_1cpwOCr9le9eI8il5PSt2q6iLXd8yy_HjJ_lq5hKVrOb0NFwaQrOiVfhYrTmJAz6MFhz6jqviiIx9j1b4UgetENhUCaaEG5sCsKAc-r7qlrwje9nefr-41JmvNW6USGebmMVY8-vmQIYDmJWvb4AKAaNmcFowinxCIkgQ8BN4hwqrg-mB-jPwIki7t876y1SwOZT11ySx6_uYPM')"}} />
                <div className="flex flex-col justify-center">
                  <p className="text-xl sm:text-[22px] font-bold tracking-[-0.015em]">Elena Moreau</p>
                  <p className="text-[#897261] dark:text-gray-400 text-sm sm:text-base">Artisan Weaves & Co.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {[{icon:'auto_awesome',title:'Smart Product Enhancer',sub:'Refine your product descriptions'},{icon:'request_quote',title:'AI Quotation Generator',sub:'Create custom quotes instantly'},{icon:'chat',title:'WhatsApp Business',sub:'Connect with your customers'},{icon:'photo_camera',title:'Instagram Marketing',sub:'Boost your social presence'}].map((item,idx)=> (
              <div key={idx} className="flex flex-1 gap-3 rounded-lg border border-[#e6e0db] bg-white dark:bg-[#221810]/50 dark:border-[#3a2d21] p-4 flex-col shadow-sm hover:shadow-lg transition-shadow">
                <div className="text-[#ec6d13]"><span className="material-symbols-outlined text-3xl">{item.icon}</span></div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-bold">{item.title}</h2>
                  <p className="text-[#897261] dark:text-gray-400 text-sm">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Shopify card */}
          <div className="p-4">
            <div className="rounded-lg shadow-sm hover:shadow-lg bg-white dark:bg-[#221810]/50 border border-[#e6e0db] dark:border-[#3a2d21]">
              <div className="p-4 flex gap-4 items-start">
                <div className="text-[#ec6d13] pt-1"><span className="material-symbols-outlined text-3xl">storefront</span></div>
                <div className="flex flex-col flex-1">
                  <p className="text-lg font-bold tracking-[-0.015em]">Sell on Shopify (Craft Connect Hub)</p>
                  <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <p className="text-[#897261] dark:text-gray-400 flex-1">Leverage our partnership to reach a wider audience and grow your business seamlessly.</p>
                    <button className="h-10 px-4 rounded-lg bg-[#ec6d13] text-white text-sm font-medium hover:bg-[#d8620f]">Launch Shop</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArtisanHubPage;
