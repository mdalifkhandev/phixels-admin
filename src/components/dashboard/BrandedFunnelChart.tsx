import { motion } from 'framer-motion';
import { Users, MousePointer, MessageSquare, CheckCircle } from 'lucide-react';
const stages = [
  {
    id: 'visitors',
    label: 'Total Visitors',
    value: 12500,
    percent: 100,
    color: 'bg-[color:var(--deep-navy)]',
    icon: Users
  },
  {
    id: 'engaged',
    label: 'Engaged Users',
    value: 8400,
    percent: 67,
    color: 'bg-blue-800',
    icon: MousePointer
  },
  {
    id: 'contact',
    label: 'Started Contact',
    value: 3200,
    percent: 25,
    color: 'bg-red-900',
    icon: MessageSquare
  },
  {
    id: 'converted',
    label: 'Converted',
    value: 1100,
    percent: 8.8,
    color: 'bg-[color:var(--bright-red)]',
    icon: CheckCircle
  }];

export function BrandedFunnelChart() {
  return (
    <div className="w-full py-4">
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const nextStage = stages[index + 1];
          const dropOff = nextStage ?
            Math.round((stage.value - nextStage.value) / stage.value * 100) :
            0;
          return (
            <div key={stage.id} className="relative">
              {/* Funnel Bar */}
              <motion.div
                initial={{
                  width: 0,
                  opacity: 0
                }}
                animate={{
                  width: '100%',
                  opacity: 1
                }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5
                }}
                className="relative z-10">

                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg ${stage.color} flex items-center justify-center shrink-0 shadow-lg`}>

                    <stage.icon size={18} className="text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        {stage.label}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white block">
                          {stage.value.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {stage.percent}% of total
                        </span>
                      </div>
                    </div>

                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{
                          width: 0
                        }}
                        animate={{
                          width: `${stage.percent}%`
                        }}
                        transition={{
                          delay: 0.2 + index * 0.1,
                          duration: 0.8
                        }}
                        className={`h-full rounded-full ${stage.color}`} />

                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Drop-off Connector */}
              {nextStage &&
                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-white/5 -z-0 h-10">
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--bright-red)]" />
                    <span className="text-[10px] text-[color:var(--bright-red)] font-mono">
                      -{dropOff}% drop
                    </span>
                  </div>
                </div>
              }
            </div>);

        })}
      </div>
    </div>);

}