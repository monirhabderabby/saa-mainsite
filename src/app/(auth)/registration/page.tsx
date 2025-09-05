import MotionProvider from "@/providers/animation/motion-provider";
import RegistrationForm from "./_components/registration-form";

const Page = () => {
  return (
    <MotionProvider>
      <div className="h-screen flex justify-center items-center">
        <RegistrationForm />
      </div>
    </MotionProvider>
  );
};

export default Page;
