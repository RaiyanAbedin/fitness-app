import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, TrendingUp, Activity, Calendar, Dumbbell, BarChart2, Zap, Clock
} from 'lucide-react';


// Component that displays user analytics, including cumulative workouts, exercise history, workout activity, workout focus, average workout duration, and number of workouts this week
const Analytics = () => {
  const [userData, setUserData] = useState(null);
  const [cumulativeWorkouts, setCumulativeWorkouts] = useState([]);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [workoutActivity, setWorkoutActivity] = useState([]);
  const [workoutFocus, setWorkoutFocus] = useState([]);
  const [avgDuration, setAvgDuration] = useState(0);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          setError('User not logged in.');
          setLoading(false);
          return;
        }

        // 1) Fetch user profile
        const { data: user } = await axios.get(
          `http://127.0.0.1:5000/api/users/${userId}`
        );
        setUserData(user);

        // 2) Fetch workout logs
        const { data: logsData } = await axios.get(
          `http://127.0.0.1:5000/api/workout-logs/${userId}`
        ); // :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
        const logs = logsData.workout_logs || [];

        // 3) Cumulative Workouts over time
        let total = 0;
        const cumulative = logs
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(l => {
            total += 1;
            const d = new Date(l.date);
            return {
              date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              total
            };
          });
        setCumulativeWorkouts(cumulative);

        // 4) Exercises per Session
        const exercisesPerSession = logs.map(l => {
          const d = new Date(l.date);
          return {
            date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            count: (l.exercises && l.exercises.length) || 0
          };
        });
        setExerciseHistory(exercisesPerSession);

        // 5) Weekly Activity (last 7 days, binary)
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        const activity = logs
          .filter(l => new Date(l.date) >= sevenDaysAgo)
          .map(l => {
            const d = new Date(l.date);
            const dayLabel = d.toLocaleDateString(undefined, {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            });
            return {
              day: dayLabel,
              workouts: 1,
              plan: l.plan_used || 'Workout'
            };
          });
        setWorkoutActivity(activity);

        // 6) Compute avg duration and workouts this week
        const totalDur = logs.reduce((sum, l) => sum + Number(l.duration || 0), 0);
        setAvgDuration(logs.length ? Math.round(totalDur / logs.length) : 0);
        setWorkoutsThisWeek(activity.length);

        // 7) Workout Focus by mood distribution
        const moodCounts = logs.reduce((acc, log) => {
          const m = log.mood || 'Unknown';
          acc[m] = (acc[m] || 0) + 1;
          return acc;
        }, {});
        const dynamicFocus = Object.entries(moodCounts).map(([name, value]) => ({
          name,
          value
        }));
        setWorkoutFocus(dynamicFocus);

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to fetch analytics data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-[#0ff] text-xl animate-pulse">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-red-400 text-center p-8 bg-gray-800/70 rounded-lg shadow-md border border-red-500/50">
          <div className="text-xl font-bold mb-4">{error}</div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white rounded backdrop-blur-sm border border-gray-700 hover:border-[#0ff]/50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-[#0ff]" />
          Fitness Analytics Dashboard
        </h1>

        {/* Top Two Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cumulative Workouts */}
          <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0ff]" /> Your Workouts Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cumulativeWorkouts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                <Legend />
                <Line
                  type="monotone" dataKey="total" name="Total Workouts"
                  stroke="#0ff" strokeWidth={2}
                  dot={{ stroke: '#0ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#0ff', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Exercises per Session */}
          <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#f0f]" /> Exercises per Session
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={exerciseHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }}
                  formatter={v => [v, 'Exercises']} 
                />
                <Legend />
                <defs>
                  <linearGradient id="exerciseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f0f" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone" dataKey="count" name="Exercises"
                  stroke="#f0f" fill="url(#exerciseFill)" strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Two Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Activity */}
          <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0ff]" /> Weekly Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workoutActivity} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="day" stroke="#999" />
                <YAxis stroke="#999" domain={[0,1]} ticks={[0,1]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }}
                  formatter={(value, name, entry) => [value, entry.payload.plan]}
                  labelFormatter={label => `Date: ${label}`}
                />
                <Legend />
                <Bar dataKey="workouts" name="Logged">
                  {workoutActivity.map((_, idx) => (
                    <Cell key={idx} fill="#0ff" radius={[4,4,0,0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Workout Focus */}
          <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#f0f]" /> Your Mood
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workoutFocus} cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value" nameKey="name" label
                >
                  {workoutFocus.map((_, idx) => ( 
                    <Cell key={idx} fill={['#0ff','#f0f','#0f0','#ff0'][idx % 4]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Updated Performance Metrics */}
        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#0ff]" /> Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <h3 className="text-md font-medium mb-2 text-gray-300">Average Workout Duration</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0ff]" />
                <span className="text-2xl font-bold text-white">{avgDuration} min</span>
              </div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <h3 className="text-md font-medium mb-2 text-gray-300">Workouts This Week</h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#f0f]" />
                <span className="text-2xl font-bold text-white">{workoutsThisWeek}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
