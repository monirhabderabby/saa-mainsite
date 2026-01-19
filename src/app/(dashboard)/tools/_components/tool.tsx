import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

const Tool = ({ name, icon: Icon, description, href, color }: Props) => {
  return (
    <Link key={name} href={href}>
      <div className="group cursor-pointer h-full">
        <div
          className={`${color} border rounded-lg p-4 h-full flex flex-col hover:shadow-md transition-all duration-200 hover:border-gray-300 hover:bg-white`}
        >
          {/* Icon */}
          <div className="mb-3">
            <div className="inline-flex p-2 rounded-md bg-white border border-gray-200">
              <Icon className="w-4 h-4 text-gray-700" />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          <p className="text-xs text-gray-500 flex-grow mb-3">{description}</p>

          {/* Arrow */}
          <div className="flex items-center text-blue-600 text-xs font-medium group-hover:translate-x-0.5 transition-transform opacity-0 group-hover:opacity-100">
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Tool;
