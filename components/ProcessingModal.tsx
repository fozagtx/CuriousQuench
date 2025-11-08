'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
}

export default function ProcessingModal({ isOpen }: ProcessingModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowSuccess(false);
      
      // Show success tick after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(true);
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
      setShowSuccess(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
          >
            <div className="flex flex-col items-center space-y-6 relative">
              {/* Levitating Logo */}
              <AnimatePresence mode="wait">
                {!showSuccess ? (
                  <motion.div
                    key="logo"
                    initial={{ scale: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      y: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                      rotate: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                      exit: { duration: 0.3 }
                    }}
                    className="relative w-24 h-24"
                  >
                    <Image
                      src="/logo.png"
                      alt="Curious Quench Logo"
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                    {/* Glow effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-blue-400 rounded-full blur-xl -z-10"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative"
                  >
                    <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={2} />
                    {/* Success glow */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-green-400 rounded-full blur-xl -z-10"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Text Animation */}
              <AnimatePresence mode="wait">
                {!showSuccess ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.3 }}
                    className="text-center space-y-2"
                  >
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Hold on, dude! 🚀
                    </h3>
                    <p className="text-muted-foreground">
                      Processing your record and granting rewards...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2"
                  >
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Success! 🎉
                    </h3>
                    <p className="text-muted-foreground">
                      Your reward has been granted!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading spinner - only show when processing */}
              {!showSuccess && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
                />
              )}

              {/* Particles effect */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: [0, Math.cos((i * Math.PI) / 3) * 60],
                    y: [0, Math.sin((i * Math.PI) / 3) * 60],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut",
                  }}
                  className="absolute w-2 h-2 bg-blue-500 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
