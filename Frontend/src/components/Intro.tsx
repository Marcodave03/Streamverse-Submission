import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface EnhancedIntroProps {
  title?: string
  color?: "blue" | "pink" | "purple" | "white"
  onComplete?: () => void
}

const Intro: React.FC<EnhancedIntroProps> = ({ 
  title = "Conversia", 
  color = "blue", 
  onComplete 
}) => {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
      onComplete?.()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onComplete])

  // Color configurations
  const colorConfig = {
    blue: {
      gradient: "from-blue-400 via-blue-500 to-cyan-600",
      particle: "bg-blue-400",
      glow: "bg-blue-500",
      border: "border-blue-500",
      loading: "from-blue-500 to-cyan-600",
      shadow: "rgba(59, 130, 246, 0.5)",
      dropShadow: "rgba(59, 130, 246, 0.3)",
    },
    pink: {
      gradient: "from-pink-400 via-pink-500 to-rose-600",
      particle: "bg-pink-400",
      glow: "bg-pink-500",
      border: "border-pink-500",
      loading: "from-pink-500 to-rose-600",
      shadow: "rgba(236, 72, 153, 0.5)",
      dropShadow: "rgba(236, 72, 153, 0.3)",
    },
    purple: {
      gradient: "from-purple-400 via-purple-500 to-violet-600",
      particle: "bg-purple-400",
      glow: "bg-purple-500",
      border: "border-purple-500",
      loading: "from-purple-500 to-violet-600",
      shadow: "rgba(147, 51, 234, 0.5)",
      dropShadow: "rgba(147, 51, 234, 0.3)",
    },
    white: {
      gradient: "from-gray-100 via-white to-gray-200",
      particle: "bg-white",
      glow: "bg-white",
      border: "border-white",
      loading: "from-gray-300 to-white",
      shadow: "rgba(255, 255, 255, 0.5)",
      dropShadow: "rgba(255, 255, 255, 0.3)",
    },
  }

  const currentColor = colorConfig[color]

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.8,
      rotateX: -90,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
        type: "spring",
        stiffness: 100,
      },
    }),
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      y: -100,
      transition: {
        duration: 1.2,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  }

  const backgroundVariants = {
    initial: {
      background: "radial-gradient(circle at 50% 50%, #000000 0%, #000000 100%)",
    },
    animate: {
      background: [
        "radial-gradient(circle at 50% 50%, #000000 0%, #0a0a0a 50%, #000000 100%)",
        "radial-gradient(circle at 30% 70%, #0a0a0a 0%, #000000 50%, #000000 100%)",
        "radial-gradient(circle at 70% 30%, #000000 0%, #0a0a0a 50%, #000000 100%)",
        "radial-gradient(circle at 50% 50%, #000000 0%, #0a0a0a 50%, #000000 100%)",
      ],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  }

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: [0, 0.6, 0],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 3 + 2,
  }))

  return (
    <AnimatePresence mode="wait">
      {showIntro && (
        <motion.div
          className="fixed inset-0 z-[1001] overflow-hidden bg-black"
          variants={backgroundVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Animated Background */}
          <motion.div 
            className="absolute inset-0 bg-black" 
            variants={backgroundVariants} 
            initial="initial" 
            animate="animate" 
          />

          {/* Particles */}
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className={`absolute ${currentColor.particle} rounded-full opacity-20`}
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Main Content Container */}
          <div className="flex justify-center items-center h-full relative">
            {/* Glow Effect Behind Text */}
            <motion.div
              className="absolute inset-0 flex justify-center items-center"
              variants={glowVariants}
              initial="initial"
              animate="animate"
            >
              <div className={`w-96 h-96 ${currentColor.glow} rounded-full blur-3xl opacity-15`} />
            </motion.div>

            {/* Text Container */}
            <motion.div
              className="relative z-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-center items-center">
                {title.split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={letterVariants}
                    className={`inline-block text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r ${currentColor.gradient} bg-clip-text text-transparent`}
                    style={{
                      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                      textShadow: `0 0 30px ${currentColor.shadow}`,
                      filter: `drop-shadow(0 0 10px ${currentColor.dropShadow})`,
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              {/* Subtitle */}
              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                <p className="text-gray-500 text-sm sm:text-base md:text-lg tracking-widest uppercase">
                  Loading Conversia...
                </p>
              </motion.div>

              {/* Loading Bar */}
              <motion.div
                className="mt-8 w-64 h-1 bg-gray-900 rounded-full mx-auto overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <motion.div
                  className={`h-full bg-gradient-to-r ${currentColor.loading} rounded-full`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 2.2, duration: 1.5, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>

            {/* Corner Decorations */}
            <motion.div
              className={`absolute top-10 left-10 w-20 h-20 border-l-2 border-t-2 ${currentColor.border} opacity-30`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ delay: 1, duration: 1 }}
            />
            <motion.div
              className={`absolute top-10 right-10 w-20 h-20 border-r-2 border-t-2 ${currentColor.border} opacity-30`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            />
            <motion.div
              className={`absolute bottom-10 left-10 w-20 h-20 border-l-2 border-b-2 ${currentColor.border} opacity-30`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ delay: 1.4, duration: 1 }}
            />
            <motion.div
              className={`absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 ${currentColor.border} opacity-30`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Intro
