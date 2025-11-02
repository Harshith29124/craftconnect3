import React from "react";

const InstagramReviewPostPage = () => {
  const handleEdit = () => console.log("Edit caption");
  const handlePost = () => console.log("Post to Instagram");

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f8f7f6] dark:bg-[#221810]">
      <main className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-10 md:py-16">
        <div className="w-full max-w-[960px] flex flex-col gap-8">
          {/* Heading */}
          <div className="px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-[-0.033em] text-[#181411] dark:text-white">Almost there! Let's get this posted.</h1>
            <p className="mt-2 text-[#897261] dark:text-gray-400 md:text-lg max-w-2xl mx-auto">Securely connect your account, then review and publish your post.</p>
          </div>

          {/* Connection + Security */}
          <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full px-4">
            <div className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 min-h-14 bg-white dark:bg-[#221810] dark:border dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfqFius9QAJc5GtILRp61S4DFFuYGuPEQYaVa1-k9nGvUFJ2yEhq6RYQxOem4Z3Qxy1u4NjunSXiiPNmzzSpNrhsaddDhL-jRhdXD_ycoI2krQZXPBfjeGglX6CsiqXy24ZilKvJfBSlXUU_YmTjwNhwHSRD0QjJi6ugZoS5Kwhv1tac76eUq1FpDdlB5iEmU0imHz051jpLOk5ydNtwriM-3fktXTzEJCw3PAwcBY6p-UKcWF3E66F_ei9-5APLkPFTTey4Wxcfc')"}} />
                <p className="text-base font-medium text-[#181411] dark:text-white truncate">Connected as @artisan_handle</p>
              </div>
              <button className="text-[#ec6d13] font-bold">Disconnect</button>
            </div>
            <div className="flex items-center gap-4 rounded-lg px-4 py-3 min-h-14 bg-white/50 dark:bg-[#221810]/50">
              <div className="size-10 rounded-lg bg-[#f4f2f0] dark:bg-gray-700 flex items-center justify-center text-[#181411] dark:text-white"><span className="material-symbols-outlined">lock</span></div>
              <p className="text-sm text-[#897261] dark:text-gray-400">Your account is connected safely using Instagram's official platform. We never store your password.</p>
            </div>
          </div>

          {/* Post Preview */}
          <div className="px-4 w-full max-w-lg mx-auto">
            <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="h-8 w-8 rounded-full bg-cover bg-center" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuDf7zpeKo_3XUsDUtTYCI0so9i7eoxTAj0wUQN4xMCLXY45RayXbbVFvReESYLd8Vqess8HIqCXu5Hi_bsf7C2p5mInUvVwN1SQBjidamCfCPgCr36GLeza1MbQxxuva1NZqrRdAVEOoyiblChtUfUMXuFVkCRBHcs1Oow6nOWwjAVuefW5Zy1FoUE9Jds479jd6QfmHikLxFTDm0c6NNb9BLgPJqPRBnFK-xbSpRTJUOz7j-W1N7xpAdRDPX5HqERPbadOuYRekNI')"}} />
                <p className="text-sm font-bold text-[#181411] dark:text-white">artisan_handle</p>
                <span className="material-symbols-outlined ml-auto text-[#181411] dark:text-white">more_horiz</span>
              </div>
              <div className="aspect-square bg-cover bg-center" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuD3sYdRqOmlPw0BJ5xv0nKksw8G3O2fHbufJX4mXXrQkBVQ9BTHCqO7hKt8_AFvFY2xU5dn-54U8jxH5W4gVlOR4_MU9Ew-kwvPPXac60cPFQv3BPT1pnvFFQh0R_DhFnEgYMcobkpUlFjjQtDQDG21H-tn_HDDPK3v0jWqzWyCQl-YU_BMEI747xV6lr_VKsejw8V6wf8qcZoHt116AP2J67lDpP66Y8oEFhxjA0E3GiI8SoGNgdDJkveVPbmon-1L0jYDsk9_a-I')"}} />
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-4 text-[#181411] dark:text-white">
                  <span className="material-symbols-outlined">favorite</span>
                  <span className="material-symbols-outlined">chat_bubble_outline</span>
                  <span className="material-symbols-outlined">send</span>
                  <span className="material-symbols-outlined ml-auto">bookmark_border</span>
                </div>
                <div>
                  <p className="text-sm text-[#181411] dark:text-white"><span className="font-bold">artisan_handle</span> Introducing our new handcrafted ceramic vase! Each piece is uniquely shaped and glazed, perfect for adding a touch of rustic charm to your home.</p>
                  <p className="text-sm text-[#ec6d13]">#handmade #ceramics #potterylove #shoplocal #artisanmade</p>
                  <p className="text-sm text-[#897261] dark:text-gray-400 mt-1">View all 12 comments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center mt-4">
            <div className="w-full max-w-[480px] flex flex-col gap-3 px-4 py-3">
              <button onClick={handleEdit} className="h-12 w-full rounded-lg bg-[#e5e7eb] dark:bg-gray-700 text-[#181411] dark:text-white font-bold hover:bg-[#d1d5db] dark:hover:bg-gray-600">Edit Caption / Hashtags</button>
              <button onClick={handlePost} className="h-12 w-full rounded-lg bg-[#ec6d13] text-white font-bold hover:bg-[#d8620f]">Post to Instagram Now</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstagramReviewPostPage;
