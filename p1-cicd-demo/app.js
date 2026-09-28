// 第 4 课：用 JavaScript 让页面"活"起来。
//
// ┌──────────────────────────────────────────────────────────────┐
// │ 这一课你要自己写的只有 5 处，都在下面标着「TODO 01」～「TODO 05」。   │
// │ 每一处都精确写明了**改哪一行**，照着改就行。                        │
// │                                                              │
// │   TODO 01  极简单  点"返回顶部"按钮，回到页面顶部                  │
// │   TODO 02  极简单  滚过大半屏，这个按钮才浮出来                    │
// │   TODO 03  简单    顶部一条阅读进度条，随滚动变长                  │
// │   TODO 04  简单    顶部导航当前项高亮 + 右下角显示栏目名           │
// │   TODO 05  中等    点导航、按后退键，高亮都跟着走                  │
// │                                                              │
// │ 文件最后还有两段**已经写好的代码**（滚动自动高亮、栏目淡入）。      │
// │ 它们用到的 IntersectionObserver 超出本课范围，**不用你写**，       │
// │ 但要读一遍注释、知道它在做什么——手册里「本课已写好的部分」一节会讲。                 │
// └──────────────────────────────────────────────────────────────┘
//
// 一个重要前提：HTML 里的 <a href="#skills"> 本身就能跳转，**不需要 JavaScript**。
// JS 在这一课只负责"告诉用户现在在哪""让页面更好用"，不接管跳转。
// 这叫渐进增强：JS 挂了页面照样能读，只是少了提示。

// ===================== 准备：把要用到的元素抓到手 =====================
// 这一段已经写好，不用改，但要看懂——后面每个任务都要用这里的变量。
//
// querySelector     按选择器找**第一个**，找不到返回 null
// querySelectorAll  按选择器找**全部**，返回一个可以 forEach 的集合
// 选择器写法和 CSS 完全一样：#id 找 id，.class 找类，nav a 找范围里的 a
const progressBar = document.querySelector('#reading-progress')
const indicator = document.querySelector('#section-indicator')
const toTopButton = document.querySelector('#to-top')
const navLinks = document.querySelectorAll('nav a')

// 页面上所有栏目。hero 是首屏，section 是其余栏目，两类都要。
const sections = document.querySelectorAll('main .hero[id], main section[id]')

// 导航链接上的文字就是栏目的中文名，直接拿来用，不另外维护一份对照表。
// 好处：以后在 HTML 里加一个栏目，这个文件一行都不用改。
const sectionNames = new Map()
navLinks.forEach(link => {
  sectionNames.set(link.getAttribute('href'), link.textContent.trim())
})

// ══════════════════════════════════════════════════════════════
// TODO 01（极简单）· 点"返回顶部"按钮，回到页面顶部
// ══════════════════════════════════════════════════════════════
// 效果位置：页面右下角那个圆形按钮。
// 现在点它没反应，做完之后页面会平滑地滚回最上面。
//
// 改哪里：就是下面这个大括号里面，**只加一行**。
//
// 要加的那一行：
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//
// 三个词的意思：
//     window.scrollTo   让窗口滚到某个位置
//     top: 0            滚到最顶上（0 像素处）
//     behavior:'smooth' 平滑地滚过去，不写就是"啪"地瞬间跳
toTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // 下面两行已经写好，不用动。
  // 作用：回到顶部后地址栏的 # 还停在刚才那个栏目，手动同步一下，
  // 否则右下角徽标还写着"技能"，人却已经在最上面了。
  history.replaceState(null, '', location.pathname)
  showCurrent('#about')
})

// ══════════════════════════════════════════════════════════════
// TODO 02（极简单）· 滚过大半屏，"返回顶部"按钮才浮出来
// ══════════════════════════════════════════════════════════════
// 效果位置：还是右下角那个按钮。
// 现在它一直在，做完之后：页面在最上面时它是隐藏的，往下滚一段才出现。
//
// 改哪里：下面 handleScroll 函数里，把标着「← 改这一行」的那一行补完整。
//
// 要用到的三样东西：
//     window.scrollY        现在向下滚了多少像素
//     window.innerHeight    窗口有多高
//     classList.toggle(类名, 条件)   条件为 true 就加这个类，false 就去掉
//
// 按钮长什么样、怎么淡入，**全由 CSS 的 #to-top.is-visible 决定**，
// JS 只负责决定"什么时候加上 is-visible 这个类"。
// 这是前端很常见的分工：**JS 管状态，CSS 管样子。**

function handleScroll() {
  // 用 innerHeight * 0.6（六成屏高）而不是写死 500px——
  // 手机屏和电脑屏高度差很多，写死的数字在一种设备上一定不合适。
  toTopButton.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6) // ← 改这一行

  updateProgress() // TODO 03 写完之后，这一行会让进度条动起来
}

// 这一行已经写好：告诉浏览器"页面一滚动就执行 handleScroll"。
//
// 为什么两件事（按钮、进度条）合在一个函数里？
// 因为滚动一秒能触发几十次，**监听器越少越好**。
window.addEventListener('scroll', handleScroll)

// ══════════════════════════════════════════════════════════════
// TODO 03（简单）· 顶部一条阅读进度条
// ══════════════════════════════════════════════════════════════
// 效果位置：页面最上沿，一条横贯全屏的细线，往下滚会变长。
// 现在它始终是 0 宽（看不见），做完之后跟着滚动增长。
//
// 改哪里：下面 updateProgress 函数里，把标着「← 改这一行」的那一行补完整。
//
// 算法就一句话：**已经滚过的距离 ÷ 能滚的总距离 = 读了百分之多少**。
//     window.scrollY                  已经向下滚了多少
//     documentElement.scrollHeight    整个文档有多高
//     window.innerHeight              窗口有多高
//     能滚的总距离 = scrollHeight - innerHeight
//
// 要加的那一行：
//     progressBar.style.width = `${ratio * 100}%`
//
// 注意反引号 ` 不是单引号 '。这叫模板字符串，里面 ${} 会被替换成变量的值。
// ratio 是 0 到 1 的小数，乘 100 才是百分数。

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight

  // 这一行已经写好，但值得看一眼：页面太短时 scrollable 可能是 0，
  // 除以 0 会得到 NaN，进度条就再也不动了。
  // **凡是分母可能为 0 的地方，都要先挡一下。**
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0

  progressBar.style.width = `${ratio * 100}%` // ← 改这一行
}

// ══════════════════════════════════════════════════════════════
// TODO 04（简单）· 导航当前项高亮 + 右下角显示栏目名
// ══════════════════════════════════════════════════════════════
// 效果位置：两处一起变——顶部导航栏、右下角小徽标。
// 现在不管在哪个栏目，导航都是一个样、徽标是空的。
//
// 改哪里：下面 showCurrent 函数里，**两行**标着「← 改这一行」的。
//
// 第一行（徽标）：
//     indicator.textContent = sectionNames.get(current) || ''
//     textContent 是"这个元素里显示的文字"。
//     Map.get 取不到时返回 undefined，用 || '' 兜底，
//     **别让页面上出现 "undefined" 这个词**。
//
// 第二行（导航高亮）：
//     link.classList.toggle('is-current', isCurrent)
//     和 TODO 02 用的是同一个方法。高亮长什么样由 CSS 的
//     nav a.is-current 决定，JS 只管什么时候加这个类。

function showCurrent(hash) {
  // 没有 # 时默认第一个栏目，否则刚打开页面什么都不高亮
  const current = hash || '#about'

  indicator.textContent = sectionNames.get(current) || '' // ← 改这一行

  // forEach 把 navLinks 里每个链接都过一遍
  navLinks.forEach(link => {
    // 这个链接的 href 和当前栏目一样吗？一样就是"当前项"
    const isCurrent = link.getAttribute('href') === current

    link.classList.toggle('is-current', isCurrent) // ← 改这一行

    // 下面三行已经写好，不用动。
    // 作用：告诉读屏软件"当前在这一项"。视觉上看不见，
    // 但在 F12 的 Elements 面板里能看到它跟着高亮移动。
    // **无障碍不是额外功能，是基本要求。**
    if (isCurrent) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
}

// ══════════════════════════════════════════════════════════════
// TODO 05（中等）· 点导航、按后退键，高亮都跟着走
// ══════════════════════════════════════════════════════════════
// 效果位置：顶部导航 + 右下角徽标。
// 现在点导航跳过去了，但高亮不动；按浏览器后退键也不动。
//
// 改哪里：下面**两行**，第一行监听事件，第二行是最容易漏的那一行。
//
// 第一行：
//     window.addEventListener('hashchange', () => showCurrent(location.hash))
//
//     地址栏里 # 后面那一段叫 hash。点 <a href="#skills"> 会把它改成 #skills，
//     hash 一变浏览器就触发 hashchange 事件；**按前进/后退键也会触发**。
//
// 第二行（这一课最容易漏的一行）：
//     showCurrent(location.hash)
//
//     为什么还要单独调一次？因为别人把 index.html#skills 这个链接直接发给你，
//     你打开时 hash 从头到尾**没有"变化"过**，hashchange 根本不会触发，
//     于是什么都不高亮。
//     **"监听变化"和"一开始先做一次"是两件事，两件都要做。**

window.addEventListener('hashchange', () => showCurrent(location.hash)) // ← 改这一行
showCurrent(location.hash) // ← 改这一行（最容易漏）

// 首屏也要把进度条算一次，否则刷新页面时进度条是 0，
// 但其实浏览器已经把你滚到中间了。和上面是同一个道理。
updateProgress()

// ══════════════════════════════════════════════════════════════
// 下面两段是**已经写好的**，不用你动手 —— 但要读一遍
// ══════════════════════════════════════════════════════════════
// 它们用到的 IntersectionObserver 超出本课范围（本课只要求掌握
// querySelector / addEventListener / classList / textContent 这几样基础）。
//
// 但页面上最好看的两个效果正是它俩做的，所以代码给你写好，
// **你只要知道它在干什么就行**。手册里「本课已写好的部分」一节会讲。

// ---------- 已写好（一）：往下滚，高亮自己跟着换 ----------
// 效果：**不用点任何东西**，滚到哪个栏目，导航和徽标自己跟着变。
//
// IntersectionObserver 是浏览器内置的"监视器"：
// 告诉它盯哪些元素，这些元素进出屏幕时它通知你。
//
// 为什么不在 scroll 里自己算？可以，但 scroll 一秒触发几十次，
// 每次都去算七个栏目的位置会让页面发卡。
// 这个 API 由浏览器底层实现，只在真的进出时才通知，省事也省性能。
const spy = new IntersectionObserver(
  entries => {
    for (const entry of entries) {
      // isIntersecting：这个元素现在在（收窄后的）屏幕里吗
      if (entry.isIntersecting) showCurrent(`#${entry.target.id}`)
    }
  },
  {
    // rootMargin 把判定范围上下各收窄 45%，只剩屏幕中间一条。
    // 意思是"必须滚到屏幕中间才算进入这个栏目"。
    // 不收窄的话，栏目刚露个头就切换，滚动时高亮会来回乱跳。
    rootMargin: '-45% 0px -45% 0px',
  },
)
sections.forEach(section => spy.observe(section))

// ---------- 已写好（二）：栏目进入屏幕时淡入上移 ----------
// 效果：整页内容不再是"一开始就全在那儿"，而是滚到哪里、哪里浮现出来。
//
// 还是 IntersectionObserver，但这次的选项完全不同：
//   threshold: 0.15   露出 15% 就算进入（上面那个要滚到正中间）
//   进入后 unobserve   只淡入一次，往回滚不会再淡一遍
//
// **同一个工具，换一组参数就是另一种效果**——这是值得记住的一点。
const reveal = new IntersectionObserver(
  (entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-visible')
      // 已经显示过就不用再盯着它了，省性能
      observer.unobserve(entry.target)
    }
  },
  { threshold: 0.15 },
)
sections.forEach(section => reveal.observe(section))
