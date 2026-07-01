import { prisma } from "./db";

const builtInTasks = [
  {
    taskKey: "sitemap-refresh",
    name: "站点地图刷新",
    schedule: "每小时",
    description: "触发公开内容页面重新验证，确保 sitemap 和文章列表及时更新。",
    nextOffsetHours: 1
  },
  {
    taskKey: "seo-audit",
    name: "SEO 诊断扫描",
    schedule: "每天 03:00",
    description: "扫描公开页面、文章和分类的 SEO 完整度。",
    nextOffsetHours: 24
  },
  {
    taskKey: "contact-maintenance",
    name: "线索数据巡检",
    schedule: "每天 04:00",
    description: "统计未读联系记录，并为后台概览提供状态数据。",
    nextOffsetHours: 25
  }
];

export async function ensureScheduledTasks() {
  const now = Date.now();

  await Promise.all(
    builtInTasks.map((task) =>
      prisma.scheduledTask.upsert({
        where: { taskKey: task.taskKey },
        update: {},
        create: {
          taskKey: task.taskKey,
          name: task.name,
          schedule: task.schedule,
          description: task.description,
          nextRunAt: new Date(now + task.nextOffsetHours * 60 * 60 * 1000)
        }
      })
    )
  );
}
