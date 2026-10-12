// ============================================================
//  大白鲨音乐资料库 · 资料清单（你自己维护这个文件即可）
// ============================================================
//  【怎么加新资料】三步：
//   1. 把资料文件放进 materials/ 对应科目的文件夹里
//   2. 在下面对应科目的 chapters 里找到章节，在 files 数组里加一行：
//        { name: "文件名.后缀", path: "materials/科目名/文件名.后缀", updated: "2026-10-12" }
//      - 如果章节还不存在，就自己加一个章节：
//        { name: "第X章 章节名", files: [ 上面那行 ] }
//   3. 保存文件，重新上传整个网站文件夹（或按 README 里的方法部署）即可
//
//  【说明】
//   - 文件类型自动识别：.pdf=PDF 讲义 / .jpg .png .gif .webp=图片 / .mp3 .wav .m4a .ogg .flac=音频 / 其他=文件
//   - 列表会自动按名称排序（拼音），不用你操心顺序
//   - updated 写日期即可，格式 年-月-日，例：2026-10-12
//   - 科目/章节的资料数量和更新时间会自动计算，不用手动填
// ============================================================

window.MATERIALS = [
  {
    name: "乐理",
    chapters: [
      // 示例格式（可删除）：
      // { name: "第一章 音与音高", files: [
      //   { name: "第一章讲义.pdf", path: "materials/乐理/第一章讲义.pdf", updated: "2026-10-12" },
      //   { name: "音阶示范.mp3",    path: "materials/乐理/音阶示范.mp3",    updated: "2026-10-12" }
      // ] }
    ]
  },
  {
    name: "视唱练耳",
    chapters: [
      // { name: "第一章 单音听辨", files: [
      //   { name: "单音练习.mp3", path: "materials/视唱练耳/单音练习.mp3", updated: "2026-10-12" }
      // ] }
    ]
  },
  {
    name: "和声学",
    chapters: [
      { name: "斯波索宾和声学教程", files: [
        { name: "斯波索宾[和声学教程].pdf", path: "materials/和声学/斯波索宾[和声学教程].pdf", updated: "2026-10-12" }
      ] }
    ]
  },
  {
    name: "Logic 入门",
    chapters: [
      // { name: "第一章 界面认识", files: [
      //   { name: "界面截图.png", path: "materials/Logic 入门/界面截图.png", updated: "2026-10-12" }
      // ] }
    ]
  },
  {
    name: "FL Studio 入门",
    chapters: [
      // { name: "第一章 快速上手", files: [
      //   { name: "上手教程.pdf", path: "materials/FL Studio 入门/上手教程.pdf", updated: "2026-10-12" }
      // ] }
    ]
  }
];
