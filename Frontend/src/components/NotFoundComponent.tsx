import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Home, ArrowLeft, RefreshCw } from "lucide-react"

interface NotFoundPageProps {
  color?: "blue" | "pink" | "purple" | "white"
  onGoHome?: () => void
  onGoBack?: () => void
}

const NotFoundComponent: React.FC<NotFoundPageProps> = ({ color = "blue" }) => {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Color configurations
  const colorConfig = {
    blue: {
      gradient: "from-blue-400 via-blue-500 to-cyan-600",
      particle: "bg-blue-400",
      glow: "bg-blue-500",
      border: "border-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
      shadow: "rgba(59, 130, 246, 0.5)",
      dropShadow: "rgba(59, 130, 246, 0.3)",
    },
    pink: {
      gradient: "from-pink-400 via-pink-500 to-rose-600",
      particle: "bg-pink-400",
      glow: "bg-pink-500",
      border: "border-pink-500",
      button: "bg-pink-600 hover:bg-pink-700",
      shadow: "rgba(236, 72, 153, 0.5)",
      dropShadow: "rgba(236, 72, 153, 0.3)",
    },
    purple: {
      gradient: "from-purple-400 via-purple-500 to-violet-600",
      particle: "bg-purple-400",
      glow: "bg-purple-500",
      border: "border-purple-500",
      button: "bg-purple-600 hover:bg-purple-700",
      shadow: "rgba(147, 51, 234, 0.5)",
      dropShadow: "rgba(147, 51, 234, 0.3)",
    },
    white: {
      gradient: "from-gray-100 via-white to-gray-200",
      particle: "bg-white",
      glow: "bg-white",
      border: "border-white",
      button: "bg-gray-600 hover:bg-gray-700",
      shadow: "rgba(255, 255, 255, 0.5)",
      dropShadow: "rgba(255, 255, 255, 0.3)",
    },
  }

  const currentColor = colorConfig[color]

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 100,
      scale: 0.5,
      rotateX: -90,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        delay: i * 0.15,
        duration: 1,
        ease: [0.6, -0.05, 0.01, 0.99],
        type: "spring",
        stiffness: 80,
      },
    }),
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  }

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: [0, 0.4, 0],
      scale: [0.8, 1.4, 0.8],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 2,
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  }

  // Generate floating particles
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 4 + 3,
  }))

  // Generate error glitch particles
  const glitchParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    width: Math.random() * 40 + 10,
    height: Math.random() * 2 + 1,
  }))

  const handleGoHome = () => {
    (window.location.href = "/")
  }

  const handleGoBack = () => {
    window.history.back()
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-[1001] overflow-hidden bg-black">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-black"
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
      />

      {/* Floating Particles */}
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
              y: [0, -40, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Glitch Effect Particles */}
      <div className="absolute inset-0">
        {glitchParticles.map((particle) => (
          <motion.div
            key={`glitch-${particle.id}`}
            className={`absolute ${currentColor.particle} opacity-10`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.width}px`,
              height: `${particle.height}px`,
            }}
            animate={{
              opacity: [0, 0.3, 0],
              scaleX: [1, 0.8, 1.2, 1],
            }}
            transition={{
              duration: 0.1,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: Math.random() * 2 + 1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col justify-center items-center h-full relative px-4">
        {/* Glow Effect Behind Text */}
        <motion.div
          className="absolute inset-0 flex justify-center items-center"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        >
          <div className={`w-[500px] h-[500px] ${currentColor.glow} rounded-full blur-3xl opacity-10`} />
        </motion.div>

        <AnimatePresence>
          {showContent && (
            <motion.div
              className="relative z-10 text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* 404 Text */}
              <div className="flex justify-center items-center mb-8">
                {"404".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={letterVariants}
                    className={`inline-block text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-bold bg-gradient-to-r ${currentColor.gradient} bg-clip-text text-transparent`}
                    style={{
                      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                      textShadow: `0 0 40px ${currentColor.shadow}`,
                      filter: `drop-shadow(0 0 15px ${currentColor.dropShadow})`,
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              {/* Error Message */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-4">Page Not Found</h2>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed">
                  The page you're looking for seems to have vanished into the digital void. Let's get you back on track.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleGoHome}
                  className={`flex items-center gap-2 px-6 py-3 ${currentColor.button} text-white rounded-lg font-medium transition-colors duration-200 shadow-lg`}
                >
                  <Home size={20} />
                  Go Home
                </motion.button>

                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleGoBack}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                >
                  <ArrowLeft size={20} />
                  Go Back
                </motion.button>

                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                >
                  <RefreshCw size={20} />
                  Refresh
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner Decorations with Error Theme */}
        <motion.div
          className={`absolute top-10 left-10 w-16 h-16 border-l-2 border-t-2 ${currentColor.border} opacity-20`}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: 0.2, scale: 1, rotate: [0, 5, -5, 0] }}
          transition={{
            delay: 1.5,
            duration: 1,
            rotate: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />
        <motion.div
          className={`absolute top-10 right-10 w-16 h-16 border-r-2 border-t-2 ${currentColor.border} opacity-20`}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: 0.2, scale: 1, rotate: [0, -5, 5, 0] }}
          transition={{
            delay: 1.7,
            duration: 1,
            rotate: {
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />
        <motion.div
          className={`absolute bottom-10 left-10 w-16 h-16 border-l-2 border-b-2 ${currentColor.border} opacity-20`}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: 0.2, scale: 1, rotate: [0, 5, -5, 0] }}
          transition={{
            delay: 1.9,
            duration: 1,
            rotate: {
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />
        <motion.div
          className={`absolute bottom-10 right-10 w-16 h-16 border-r-2 border-b-2 ${currentColor.border} opacity-20`}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: 0.2, scale: 1, rotate: [0, -5, 5, 0] }}
          transition={{
            delay: 2.1,
            duration: 1,
            rotate: {
              duration: 2.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />
      </div>
    </div>
  )
}

export default NotFoundComponent
