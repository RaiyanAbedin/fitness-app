import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Dumbbell, Salad, Sparkles, Zap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <Sparkles className="h-12 w-12 text-[#0ff] animate-pulse" />
            <div className="absolute inset-0 blur-xl bg-[#0ff] opacity-30 rounded-full"></div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0ff] to-[#f0f] leading-tight">
            NuroFit
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-gray-300">
          AI-Personalised Fitness. Tailored to You. Accessible to All!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#0ff] to-[#f0f] hover:opacity-90 text-black font-bold px-8 py-6 text-lg rounded-full flex items-center"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-[#0ff] text-[#0ff] hover:bg-[#0ff]/10 px-8 py-6 text-lg rounded-full"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* App Preview - may use this if i ever want to update the app priview or use this section as a promo page
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0ff]/5 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-4xl">
            <div className="bg-gradient-to-r from-[#0ff]/20 to-[#f0f]/20 rounded-3xl p-1">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                <img 
                  src="/api/placeholder/1000/600" 
                  alt="FitAI App Interface" 
                  className="w-full h-auto" 
                />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-32 w-32 bg-[#0ff] opacity-20 blur-3xl rounded-full"></div>
            <div className="absolute -top-4 -left-4 h-32 w-32 bg-[#f0f] opacity-20 blur-3xl rounded-full"></div>
          </div>
        </div>
      </section>
      */}

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-[#0ff] to-[#f0f]">
          Smart Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-10 w-10 text-[#0ff]" />,
              title: "Smart Meal Planning",
              description:
                "Get personalized meal suggestions based on your dietary preferences, calorie targets, and specific food requests. Every meal includes nutritional breakdown and easy-to-follow recipes.",
            },
            {
              icon: <Dumbbell className="h-10 w-10 text-[#f0f]" />,
              title: "Personalized Workouts",
              description: "AI generates targeted workout routines based on your fitness level, available time, and specific goals. Save and experiment with different routines.",
            },
            {
              icon: <Zap className="h-10 w-10 text-[#0ff]" />,
              title: "Real-time Tracking",
              description: "The second-brain for logging workouts, tracking your progress and maintaining a detailed history of your fitness journey",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-[#0ff]/50 transition-all group"
            >
              <div className="mb-6 relative">
                {feature.icon}
                <div className="absolute inset-0 blur-xl bg-[#0ff] opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-[#0ff] transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-[#0ff] to-[#f0f]">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "University Student",
                role: "Aiming to Gain Muscle Within a Hectic Student Routine",
                quote:
                  "Balancing my dissertation as a final year student, graduate job applications and part time-work, entering the gym felt overwhelming. NuroFit's personalized workout plans and meal suggestions have been a lifesaver, I have been able to focus on my weaker muscle groups due to their smart recommendations whilst balancing my workload.",
              },
              {
                name: "Vegan User",
                role: "Intermediate Gym-Goer", 
                quote:
                  "Going to the gym regularly as a vegan, finding meal plans that meet my protein needs has always been challenging. NuroFit suggests creative plant-based meals that align perfectly with my training schedule and dietary needs. I love the shopping list feature as it provides a clear overview of the ingredients and quantities needed for each meal.",
              },
              {
                name: "James T.",
                role: "Marathon Runner",
                quote:
                  "After recovering from an injury which limited my mobility for a breif period of time, I needed a way to focus on losing weight without the risk of injury. NuroFit's workout library and shopping list feature allowed me to workout and slowly lose weight at my own pace. It felt like I had a second-brain specifically focusing on my recovery and weightloss goals.",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#0ff] to-[#f0f] mr-4"></div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0ff]/10 to-[#f0f]/10 p-1 rounded-3xl">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 h-40 w-40 bg-[#0ff] opacity-20 blur-3xl rounded-full"></div>
              <div className="absolute bottom-10 right-10 h-40 w-40 bg-[#f0f] opacity-20 blur-3xl rounded-full"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0ff] to-[#f0f]">
                Ready to Transform Your Fitness Journey?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users who have achieved their fitness and nutrition goals with NuroFit.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-[#0ff] to-[#f0f] hover:opacity-90 text-black font-bold px-8 py-6 text-lg rounded-full flex items-center justify-center"
                >
                  Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border border-[#0ff] text-[#0ff] hover:bg-[#0ff]/10 px-8 py-6 text-lg rounded-full"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <Salad className="h-8 w-8 text-[#0ff] mr-2" />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0ff] to-[#f0f]">
                  NuroFit
                </span>
              </div>
              <p className="text-gray-400 mt-2">Your second brain for all fitness and nutrition needs.</p>
            </div>
            <div className="flex flex-wrap gap-8 justify-center md:justify-end">
              <a href="#" className="text-gray-400 hover:text-[#0ff] transition-colors">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0ff] transition-colors">
                Features
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0ff] transition-colors">
                Pricing
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0ff] transition-colors">
                Blog
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0ff] transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} NuroFit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;