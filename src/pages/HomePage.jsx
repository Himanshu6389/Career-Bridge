import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Heart, MapPin, Clock, DollarSign, Bookmark,
  TrendingUp, Zap, Target, Award, ArrowRight,
  Briefcase, Users, CheckCircle, Star, Eye, Share2,
  Sparkles, Search, Filter, Building2, AlertCircle
} from 'lucide-react';
import HomeLayout from '../components/HomeLayout';

const HomePage = () => {
  // ============================================
  // STATE & HOOKS
  // ============================================

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState(new Set());
  const [activeJobCard, setActiveJobCard] = useState(null);
  const [visibleJobs, setVisibleJobs] = useState(3);
  const [hoveredStat, setHoveredStat] = useState(null);

  // Redux state
  const { isAuthenticated, user } = useSelector(state => state?.user || {});
  const { applications = [], loading: appLoading } = useSelector(state => state?.application || {});
  const { jobs = [], loading: jobLoading } = useSelector(state => state?.job || {});

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (isAuthenticated) {
      // dispatch(getMyApplications({ page: 1, limit: 10 }));
      // dispatch(getAllJobs({ page: 1, limit: 12 }));
    }
  }, [dispatch, isAuthenticated]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const toggleSaveJob = (e, jobId) => {
    e.stopPropagation();
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      newSet.has(jobId) ? newSet.delete(jobId) : newSet.add(jobId);
      return newSet;
    });
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleApplyJob = (e, jobId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/jobs/${jobId}/apply`);
  };

  // ============================================
  // STATS CARDS DATA
  // ============================================

  const statsCards = [
    {
      icon: '📊',
      title: 'Applications',
      value: applications?.length || 0,
      color: 'from-blue-500 to-blue-600',
      description: 'submitted',
      trend: '+12% this month',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      lightColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: '✅',
      title: 'Shortlisted',
      value: applications?.filter(app => app.status === 'SHORTLISTED')?.length || 0,
      color: 'from-green-500 to-green-600',
      description: 'moving forward',
      trend: '+5 this week',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      lightColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: '🗓️',
      title: 'Interviews',
      value: applications?.filter(app => app.status === 'REVIEWING')?.length || 0,
      color: 'from-purple-500 to-purple-600',
      description: 'scheduled',
      trend: '+3 upcoming',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      lightColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: '❤️',
      title: 'Saved',
      value: savedJobs.size,
      color: 'from-red-500 to-red-600',
      description: 'for later',
      trend: `${savedJobs.size} active`,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      lightColor: 'text-red-600 dark:text-red-400'
    }
  ];

  // ============================================
  // QUICK ACTIONS DATA
  // ============================================

  const quickActions = [
    {
      icon: '🔍',
      title: 'Find Jobs',
      description: '10K+ openings',
      action: () => navigate('/jobs/search'),
      color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    {
      icon: '✨',
      title: 'Recommendations',
      description: 'AI-matched jobs',
      action: () => navigate('/recommendations'),
      color: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10',
      borderColor: 'border-yellow-200 dark:border-yellow-700'
    },
    {
      icon: '📄',
      title: 'My Resumes',
      description: `${user?.resumes?.length || 1} uploaded`,
      action: () => navigate('/resumes'),
      color: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10',
      borderColor: 'border-green-200 dark:border-green-700'
    },
    {
      icon: '👤',
      title: 'Profile',
      description: '85% complete',
      action: () => navigate('/profile'),
      color: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10',
      borderColor: 'border-purple-200 dark:border-purple-700'
    }
  ];

  // ============================================
  // FEATURED JOBS DATA
  // ============================================

  const featuredJobs = [
    {
      id: 'job1',
      title: 'Senior Frontend Developer',
      company: 'Google India',
      companyLogo: 'G',
      location: 'Bangalore',
      experience: '3-5 years',
      salary: '₹18-25L',
      type: 'Remote',
      gradient: 'from-blue-500 to-blue-600',
      skills: ['React', 'TypeScript', 'Node.js'],
      description: 'Build scalable web applications for 2B+ users',
      applicants: 234,
      views: 1203,
      featured: true,
      postedDays: 2
    },
    {
      id: 'job2',
      title: 'Full Stack Developer',
      company: 'Microsoft',
      companyLogo: 'M',
      location: 'Pune',
      experience: '2-4 years',
      salary: '₹15-22L',
      type: 'Hybrid',
      gradient: 'from-purple-500 to-purple-600',
      skills: ['React', 'Node.js', 'MongoDB'],
      description: 'Develop end-to-end solutions with cutting-edge tech',
      applicants: 189,
      views: 856,
      featured: false,
      postedDays: 5
    },
    {
      id: 'job3',
      title: 'Backend Developer',
      company: 'Amazon',
      companyLogo: 'A',
      location: 'Hyderabad',
      experience: '2-3 years',
      salary: '₹16-20L',
      type: 'On-site',
      gradient: 'from-orange-500 to-orange-600',
      skills: ['Java', 'AWS', 'Spring Boot'],
      description: 'Build robust backend services for millions of users',
      applicants: 412,
      views: 2103,
      featured: true,
      postedDays: 1
    },
    {
      id: 'job4',
      title: 'DevOps Engineer',
      company: 'Meta',
      companyLogo: 'F',
      location: 'Delhi',
      experience: '3-6 years',
      salary: '₹20-28L',
      type: 'Remote',
      gradient: 'from-indigo-500 to-indigo-600',
      skills: ['Kubernetes', 'Docker', 'AWS'],
      description: 'Manage cloud infrastructure and deployment pipelines',
      applicants: 156,
      views: 734,
      featured: false,
      postedDays: 3
    },
    {
      id: 'job5',
      title: 'Mobile App Developer',
      company: 'Apple',
      companyLogo: 'A',
      location: 'Bangalore',
      experience: '2-4 years',
      salary: '₹17-24L',
      type: 'On-site',
      gradient: 'from-gray-500 to-gray-600',
      skills: ['React Native', 'Swift', 'Firebase'],
      description: 'Create innovative mobile experiences for iOS',
      applicants: 298,
      views: 1567,
      featured: false,
      postedDays: 4
    },
    {
      id: 'job6',
      title: 'UI/UX Designer',
      company: 'Figma',
      companyLogo: 'F',
      location: 'Mumbai',
      experience: '2-3 years',
      salary: '₹12-18L',
      type: 'Hybrid',
      gradient: 'from-pink-500 to-pink-600',
      skills: ['Figma', 'UI Design', 'Prototyping'],
      description: 'Design beautiful and intuitive user experiences',
      applicants: 367,
      views: 1823,
      featured: true,
      postedDays: 2
    }
  ];

  // ============================================
  // WHY CHOOSE US FEATURES
  // ============================================

  const features = [
    {
      icon: <Zap size={28} />,
      title: 'Lightning Fast',
      description: 'Find and apply to jobs in seconds',
      benefit: 'Save 80% of your job search time'
    },
    {
      icon: <Target size={28} />,
      title: 'Smart Matching',
      description: 'AI-powered job recommendations',
      benefit: '95% compatibility with your skills'
    },
    {
      icon: <Award size={28} />,
      title: 'Verified Companies',
      description: 'Only trusted, verified employers',
      benefit: 'Scam-free, safe applications'
    },
    {
      icon: <CheckCircle size={28} />,
      title: 'Simple Process',
      description: 'Easy and transparent workflow',
      benefit: 'Apply with one click using resume'
    }
  ];

  // ============================================
  // RENDER - HERO SECTION (Non-Auth)
  // ============================================

  const renderHero = () => {
    if (isAuthenticated) {
      return (
        <section className="relative py-8 md:py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-teal-100 text-lg">
                    {applications.length === 0
                      ? 'Ready to find your next opportunity?'
                      : `You have ${applications.filter(a => a.status === 'REVIEWING').length} applications under review`}
                  </p>
                </div>
                <div className="hidden md:block text-6xl opacity-20">🎯</div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="relative mt-10 py-16 md:py-28 px-4 md:px-8 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Career Bridge</span> Awaits
              </h1>
              <p className="text-xl  text-slate-600 dark:text-slate-300 ">
                Connect with opportunities that match your skills. Join 50K+ successful professionals who found their dream job on CareerBridge.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Start Free
              </button>
              <button
                onClick={() => navigate('/jobs/search')}
                className="px-8 py-3 border-2 border-teal-500 text-teal-600 dark:text-teal-400 rounded-lg font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
              >
                <Search size={18} className="inline mr-2" />
                Explore Jobs
              </button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { number: '10K+', text: 'Active Jobs', icon: '💼' },
              { number: '5K+', text: 'Companies', icon: '🏢' },
              { number: '50K+', text: 'Successful Hires', icon: '✨' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 bg-white/80 dark:bg-slate-800/80 rounded-xl backdrop-blur border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{stat.number}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{stat.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ============================================
  // RENDER - STATS SECTION
  // ============================================

  const renderStats = () => {
    if (!isAuthenticated) return null;

    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">Your Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredStat(idx)}
              onMouseLeave={() => setHoveredStat(null)}
              className={`${stat.bgColor} rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-3xl">{stat.icon}</div>
                {hoveredStat === idx && <TrendingUp size={18} className={stat.lightColor} />}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{stat.title}</p>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">{stat.value}</h3>
              <div className="space-y-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">{stat.description}</p>
                <p className={`text-xs font-semibold ${stat.lightColor}`}>{stat.trend}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // ============================================
  // RENDER - QUICK ACTIONS
  // ============================================

  const renderQuickActions = () => {
    if (!isAuthenticated) return null;

    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className={`bg-gradient-to-br ${action.color} border-2 ${action.borderColor} p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left group hover:-translate-y-1`}
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-teal-600 font-medium text-sm group-hover:gap-2 transition-all">
                Explore <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  };

  // ============================================
  // RENDER - FEATURED JOBS
  // ============================================

  const renderFeaturedJobs = () => {
    const jobsToDisplay = featuredJobs.slice(0, visibleJobs);

    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Featured Opportunities</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Handpicked jobs matched to your profile</p>
          </div>
          <button
            onClick={() => navigate('/jobs/search')}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all"
          >
            View All <ArrowRight size={18} />
          </button>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobsToDisplay.map((job) => (
            <div
              key={job.id}
              onMouseEnter={() => setActiveJobCard(job.id)}
              onMouseLeave={() => setActiveJobCard(null)}
              className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:-translate-y-2 cursor-pointer"
              onClick={() => handleViewJob(job.id)}
            >
              {/* Featured Badge */}
              {job.featured && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> Featured
                </div>
              )}

              {/* Job Card Content */}
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${job.gradient} rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {job.companyLogo}
                  </div>
                  <button
                    onClick={(e) => toggleSaveJob(e, job.id)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      savedJobs.has(job.id)
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 scale-110'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 hover:text-red-600 group-hover:text-red-600'
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={savedJobs.has(job.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                {/* Title & Company */}
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium">{job.company}</p>

                {/* Job Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin size={16} className="text-teal-600 flex-shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock size={16} className="text-teal-600 flex-shrink-0" />
                    <span>{job.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <DollarSign size={16} className="text-teal-600 flex-shrink-0" />
                    <span className="font-semibold">{job.salary}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 2).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 2 && (
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                      +{job.skills.length - 2}
                    </span>
                  )}
                </div>

                {/* Job Type Badge */}
                <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-semibold mb-4">
                  {job.type}
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {job.description}
                </p>

                {/* Stats */}
                <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    {job.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {job.applicants} applied
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 flex gap-2">
                <button
                  onClick={(e) => handleApplyJob(e, job.id)}
                  className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 group-hover:scale-105 active:scale-95"
                >
                  {isAuthenticated ? 'Apply Now' : 'Sign In to Apply'}
                </button>
                <button
                  onClick={() => handleViewJob(job.id)}
                  className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleJobs < featuredJobs.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleJobs(visibleJobs + 3)}
              className="px-8 py-3 border-2 border-teal-500 text-teal-600 dark:text-teal-400 rounded-lg font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
            >
              Load More Jobs
            </button>
          </div>
        )}
      </section>
    );
  };

  // ============================================
  // RENDER - WHY CHOOSE US
  // ============================================

  const renderFeatures = () => {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose CareerBridge?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 ">
            Everything you need to land your dream job in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group text-center"
            >
              <div className="text-teal-600 dark:text-teal-400 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {feature.description}
              </p>
              <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                ✓ {feature.benefit}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // ============================================
  // RENDER - CTA SECTION (Non-Auth)
  // ============================================

  const renderCTA = () => {
    if (isAuthenticated) return null;

    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 p-8 md:p-16 text-white shadow-2xl">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Career?
            </h2>
            <p className="text-teal-100 text-lg ">
              Join thousands of successful professionals who found their dream job on CareerBridge. Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-white text-teal-600 rounded-lg font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => navigate('/jobs/search')}
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-teal-600 transition-all duration-300"
              >
                Browse Jobs
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <HomeLayout>
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero */}
      {renderHero()}

      {/* Stats */}
      {renderStats()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Featured Jobs */}
      {renderFeaturedJobs()}

      {/* Why Choose Us */}
      {renderFeatures()}

      {/* CTA */}
      {renderCTA()}

      {/* Footer spacing */}
      <div className="h-12"></div>
    </div>
    </HomeLayout>
  );
};

export default HomePage;