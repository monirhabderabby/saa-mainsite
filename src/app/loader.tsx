import BrandLoader from "@/components/shared/loader/brand-loader";

const Loader = () => {
  return (
    <div className="min-h-[400px] flex justify-center items-center">
      <BrandLoader message="Getting things ready..." />
    </div>
  );
};

export default Loader;
