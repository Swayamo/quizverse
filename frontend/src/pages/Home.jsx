"use client"

import React, { Suspense, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { motion, useScroll, useTransform } from "framer-motion"
import { Helmet } from "react-helmet"
import { useInView } from "react-intersection-observer"
// Replacing react-tilt with custom tilt effect for React 19 compatibility
import "./Home.css"

// 3D Logo Component
const Logo3D = () => {
  const mesh = React.useRef()

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.01
      mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2
    }
  })

  return (
    <mesh ref={mesh} scale={[1.5, 1.5, 1.5]} position={[0, 0, 0]}>
      <torusKnotGeometry args={[0.8, 0.3, 64, 16]} />
      <meshStandardMaterial
        color="#7d6aff"
        emissive="#5a45ff"
        emissiveIntensity={0.8}
        roughness={0.2}
        metalness={0.9}
      />
    </mesh>
  )
}

// Particle Background - simplified for better performance
const ParticleBackground = () => {
  const count = 500 // Reduced for better performance
  const positions = React.useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15
    }
    return positions
  }, [count])

  const particlesRef = React.useRef()

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#7d6aff" sizeAttenuation transparent />
    </points>
  )
}

// Parallax Camera
const ParallaxCamera = () => {
  const { scrollYProgress } = useScroll()
  const camera = useThree((state) => state.camera)

  useFrame(() => {
    camera.position.z = 10 - scrollYProgress.get() * 5
    camera.position.y = -scrollYProgress.get() * 2
  })

  return null
}

// Custom Tilt Component (React 19 compatible)
const TiltCard = ({ children, className }) => {
  const [tiltRef, setTiltRef] = React.useState(null)
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = React.useState(false)

  const handleMouseMove = (e) => {
    if (!tiltRef) return
    const rect = tiltRef.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10

    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => {
    setIsHovering(false)
    setRotation({ x: 0, y: 0 })
  }

  return (
    <div
      ref={setTiltRef}
      className={`tilt-card ${className || ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovering
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.05, 1.05, 1.05)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: isHovering ? "none" : "transform 0.5s ease",
      }}
    >
      {children}
    </div>
  )
}

// Feature Card with Tilt Effect
const FeatureCard = ({ icon, title, description }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateY: 90 }}
      animate={inView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.8, type: "spring" }}
    >
      <TiltCard className="feature-card-3d">
        <div className="feature-card">
          <i className={`${icon} feature-icon`}></i>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </TiltCard>
    </motion.div>
  )
}

// Main Component
const Home = () => {
  const { currentUser } = useAuth()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  // For lazy loading
  const [heroLoaded, setHeroLoaded] = React.useState(false)

  useEffect(() => {
    // Preload hero image
    const img = new Image()
    img.src = "/quiz-hero.svg"
    img.onload = () => setHeroLoaded(true)
  }, [])

  // Detect color scheme
  const [isDarkMode, setIsDarkMode] = React.useState(
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => setIsDarkMode(e.matches)

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return (
    <>
      <Helmet>
        <title>QuizVerse - Interactive AI-Powered Quiz Platform</title>
        <meta
          name="description"
          content="Test your knowledge with AI-generated quizzes on any topic. Create custom quizzes and track your progress with QuizVerse."
        />
        <meta property="og:title" content="QuizVerse - Interactive AI-Powered Quiz Platform" />
        <meta
          property="og:description"
          content="Create and take AI-generated quizzes on any subject. Perfect for students, educators, and curious minds."
        />
        <meta property="og:image" content="/quiz-meta-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="home-container">
        <motion.section
          className="hero-section"
          style={{ opacity, scale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="hero-3d-container">
            <Suspense fallback={<div className="loading">Loading 3D experience...</div>}>
              <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: false }}>
                <color attach="background" args={[isDarkMode ? "#2d3748" : "#f0f0f0"]} />
                <ambientLight intensity={1.5} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} />
                <Logo3D />
                <ParticleBackground />
                <OrbitControls enableZoom={false} enablePan={false} />
                <ParallaxCamera />
              </Canvas>
            </Suspense>
          </div>

          <div className="hero-content">
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Welcome to QuizVerse
            </motion.h1>
            <motion.p
              className="hero-subtitle"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Test your knowledge with AI-generated quizzes on any topic
            </motion.p>

            <motion.div
              className="hero-buttons"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {currentUser ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/dashboard" className="btn btn-primary">
                      Go to Dashboard
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/create-quiz" className="btn btn-secondary">
                      Create New Quiz
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login" className="btn btn-primary">
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register" className="btn btn-secondary">
                      Register
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>

          <motion.div
            className="hero-image"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: heroLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img src="/quiz-hero.svg" alt="Quiz illustration" />
          </motion.div>
        </motion.section>

        <motion.section
          className="features-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            initial={{ y: -30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Features
          </motion.h2>
          <div className="features-grid">
            <FeatureCard
              icon="fas fa-robot"
              title="AI-Generated Quizzes"
              description="Create custom quizzes on any topic using advanced AI technology"
            />
            <FeatureCard
              icon="fas fa-chart-line"
              title="Performance Tracking"
              description="Track your progress and see detailed analytics on your quiz performance"
            />
            <FeatureCard
              icon="fas fa-sliders-h"
              title="Customizable Difficulty"
              description="Adjust quiz difficulty to match your knowledge level"
            />
            <FeatureCard
              icon="fas fa-history"
              title="Quiz History"
              description="Review your past quizzes and learn from your mistakes"
            />
          </div>
        </motion.section>

        <motion.section
          className="how-it-works-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            initial={{ y: -30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <div className="steps-container">
            {[
              { number: 1, title: "Create Account", desc: "Sign up for a free account to access all features" },
              { number: 2, title: "Generate a Quiz", desc: "Specify your topic and difficulty level" },
              { number: 3, title: "Take the Quiz", desc: "Answer the questions and test your knowledge" },
              { number: 4, title: "Review Results", desc: "Get instant feedback and detailed analysis" },
            ].map((step, index) => (
              <motion.div
                className="step"
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div className="step-number" whileHover={{ scale: 1.2, rotate: 10 }} whileTap={{ scale: 0.9 }}>
                  {step.number}
                </motion.div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="cta-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Ready to Test Your Knowledge?
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Create your first quiz in minutes and start learning today
          </motion.p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {currentUser ? (
              <Link to="/create-quiz" className="btn btn-primary btn-large">
                Create Your First Quiz
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started Now
              </Link>
            )}
          </motion.div>
        </motion.section>
      </div>
    </>
  )
}

export default Home
