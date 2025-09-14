import TeamCard from "@/components/shared/cards/team-card";

const Page = () => {
  const teamMembers = [
    { name: "Alice", avatarUrl: "https://i.pravatar.cc/150?img=1" },
    { name: "Bob", avatarUrl: "https://i.pravatar.cc/150?img=2" },
    { name: "Charlie" },
    { name: "David" },
  ];

  return (
    <div className="p-4">
      <TeamCard
        serviceName="Payment Service"
        teamName="Team A"
        members={teamMembers}
      />
    </div>
  );
};

export default Page;
