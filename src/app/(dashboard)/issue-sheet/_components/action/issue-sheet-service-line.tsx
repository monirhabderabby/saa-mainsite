import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";

interface Props {
  data: IssueSheetData;
}

// Function to generate a color based on the service name using HSL
const generateColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }

  // Use the hash to generate a hue value (0 to 360 degrees)
  const hue = hash % 360;

  // Return a color in HSL format, adjusting saturation and lightness for vibrancy
  return `hsl(${hue}, 70%, 60%)`;
};

const IssueSheetServiceLine = ({ data }: Props) => {
  const badgeColor = generateColor(data.service.name); // Generate color based on the service name

  return (
    <div className="flex items-center justify-start space-x-2">
      <span
        className="px-3 py-1 rounded-full text-white"
        style={{ backgroundColor: badgeColor }}
      >
        {data.service.name}
      </span>
    </div>
  );
};

export default IssueSheetServiceLine;
