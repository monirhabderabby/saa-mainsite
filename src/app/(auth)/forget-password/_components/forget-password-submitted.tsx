"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, ExternalLink, Mail } from "lucide-react";

interface Props {
  email: string;
}

const ForgetPasswordSubmitted = ({ email }: Props) => {
  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1 }} // fade-in duration
    >
      {/* Success Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 text-balance">
          Check your inbox
        </h1>
        <p className="text-gray-600 mb-2 text-pretty">
          We&apos;ve sent a magic link to
        </p>
        <p className="text-gray-900 font-medium mb-6">{email}</p>
        <p className="text-sm text-gray-500 text-pretty">
          Click the link in the email to reset your password. If you don&apos;t
          see it, check your spam folder.
        </p>
      </div>

      {/* Open Email Button */}
      <Button
        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 mb-6 flex items-center justify-center gap-2"
        onClick={() =>
          window.open("https://mail.google.com/mail/u/0/#inbox", "_blank")
        }
      >
        <Mail className="w-4 h-4" />
        Open Email App
        <ExternalLink className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default ForgetPasswordSubmitted;
