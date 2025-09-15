import ServiceCard from "@/components/shared/cards/team-card";
import TeamStatsOverview from "./_components/team-stats-overview";

const services = [
  {
    id: 1,
    name: "Mobile App",
    teams: [
      {
        name: "Dart Layer",
        members: [
          { id: 1, name: "Alice Chen", avatar: "AC", role: "Lead Developer" },
          { id: 2, name: "Bob Smith", avatar: "BS", role: "Flutter Developer" },
          { id: 3, name: "Carol Davis", avatar: "CD", role: "UI/UX Designer" },
          { id: 4, name: "David Wilson", avatar: "DW", role: "QA Engineer" },
        ],
        stats: { active: 12, completed: 45, pending: 3 },
      },
      {
        name: "Dev-X",
        members: [
          {
            id: 5,
            name: "Emma Johnson",
            avatar: "EJ",
            role: "DevOps Engineer",
          },
          {
            id: 6,
            name: "Frank Miller",
            avatar: "FM",
            role: "Backend Developer",
          },
          { id: 7, name: "Grace Lee", avatar: "GL", role: "Platform Engineer" },
        ],
        stats: { active: 8, completed: 32, pending: 5 },
      },
      {
        name: "Elite Stack",
        members: [
          { id: 8, name: "Henry Brown", avatar: "HB", role: "Architect" },
          { id: 9, name: "Ivy Taylor", avatar: "IT", role: "Senior Developer" },
          { id: 10, name: "Jack Anderson", avatar: "JA", role: "Tech Lead" },
          {
            id: 11,
            name: "Kate Wilson",
            avatar: "KW",
            role: "Full Stack Developer",
          },
          {
            id: 12,
            name: "Liam Garcia",
            avatar: "LG",
            role: "Frontend Specialist",
          },
        ],
        stats: { active: 15, completed: 67, pending: 2 },
      },
    ],
  },
  {
    id: 2,
    name: "Web Platform",
    teams: [
      {
        name: "Frontend Core",
        members: [
          {
            id: 13,
            name: "Maya Patel",
            avatar: "MP",
            role: "React Specialist",
          },
          { id: 14, name: "Noah Kim", avatar: "NK", role: "TypeScript Expert" },
          {
            id: 15,
            name: "Olivia Rodriguez",
            avatar: "OR",
            role: "UI Engineer",
          },
        ],
        stats: { active: 9, completed: 28, pending: 4 },
      },
      {
        name: "Backend Services",
        members: [
          {
            id: 16,
            name: "Paul Martinez",
            avatar: "PM",
            role: "API Developer",
          },
          {
            id: 17,
            name: "Quinn Thompson",
            avatar: "QT",
            role: "Database Admin",
          },
        ],
        stats: { active: 6, completed: 41, pending: 1 },
      },
    ],
  },
];

const Page = () => {
  return (
    <div className="space-y-10">
      <TeamStatsOverview totalMembers={150} totalTeams={12} totalServices={6} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
};

export default Page;
