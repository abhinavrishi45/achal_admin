import { Clock, CheckCircle, Calendar, FileText, Check, File } from "lucide-react";

export default function Dashboard() {
  const cards = [
    {
      title: "Meetings today",
      value: "3",
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      title: "Pending tasks",
      value: "24",
      icon: <FileText className="w-6 h-6 text-purple-500" />,
      bg: "bg-purple-50",
    },
    {
      title: "Done tasks",
      value: "2",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      bg: "bg-green-50",
    },
  ];

  const myTasks = [
    { user: "Xin Yue", subject: "Algebra fractions quiz", date: "5 Oct, 12:53 pm", initial: "X", color: "bg-purple-200" },
    { user: "Omar Farooq", subject: "Solving Equations", date: "5 Oct, 11:15 am", initial: "O", color: "bg-red-200" },
    { user: "Aisha Khan", subject: "Algebra fractions pa...", date: "5 Oct, 11:13 am", initial: "A", color: "bg-green-200" },
    { user: "Leila Rahman", subject: "Solving Equations", date: "5 Oct, 11:02 am", initial: "L", color: "bg-yellow-200" },
    { user: "Bilal Ahmed", subject: "Solving Equations", date: "5 Oct, 11:01 am", initial: "B", color: "bg-blue-200" },
  ];

  const schedule = [
    { title: "Algebra", code: "QOA_SH24_BC_09_S_A", time: "10:00 am", hasRecording: true },
    { title: "Geometry", code: "QOA_SH24_BC_08_S_A", time: "11:00 am", active: true },
    { title: "Math Review Session", code: "QOA_SH24_BC_10_S_B", time: "12:00 pm" },
    { title: "Calculus", code: "QOA_SH24_BC_04_S_A", time: "01:00 pm" },
    { title: "Geometry", code: "QOA_SH24_BC_09_S_A", time: "03:00 pm" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full ${card.bg} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <button className="text-sm text-gray-400 hover:text-gray-600 font-medium flex items-center z-10 relative">
              View all <span className="ml-1">›</span>
            </button>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${card.bg} opacity-20 group-hover:scale-150 transition-transform duration-500 z-0`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Tasks Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 font-sans">My tasks</h2>
          <div className="space-y-4">
            {myTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full ${task.color} flex items-center justify-center text-gray-700 font-bold border-2 border-white shadow-sm`}>
                    {task.initial}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{task.user}</h4>
                    <p className="text-xs text-gray-500">QOA_SH2...</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 flex-1 ml-8 truncate hidden sm:block">
                  {task.subject}
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {task.date}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 text-sm text-gray-500 hover:text-gray-700 font-medium w-full text-center py-2 rounded-lg hover:bg-gray-50 transition-colors">
            View all ›
          </button>
        </div>

        {/* Schedule Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              <span className="text-gray-400 font-normal">Today, </span>Wednesday 6
            </h2>
            <div className="flex space-x-2">
               <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                   ‹
               </button>
               <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                   ›
               </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {schedule.map((slot, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl border ${
                  slot.active 
                    ? "bg-[#ec7e58] border-[#ec7e58] text-white shadow-md shadow-orange-500/20 transform hover:-translate-y-1 transition-all" 
                    : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                } cursor-pointer transition-all`}
              >
                <div className="flex items-center mb-1">
                    <h4 className={`font-bold mr-2 ${slot.active ? 'text-white' : 'text-gray-800'}`}>{slot.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${slot.active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {slot.code}
                    </span>
                </div>
                <div className={`text-sm mb-2 ${slot.active ? 'text-white/90' : 'text-gray-500'}`}>
                  {slot.time}
                </div>
                {slot.hasRecording && (
                    <div className="flex items-center text-xs text-blue-600 bg-blue-50 w-max px-2 py-1 rounded-md font-medium mt-3 border border-blue-100">
                        <File className="w-3 h-3 mr-1" />
                        Recording
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
