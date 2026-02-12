import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useUserGoals } from '../../hooks/useUserGoals'
import { useLatestBodyMetrics } from '../../hooks/useBodyMetrics'
import { useQuery, useMutation } from '@tanstack/react-query'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { UserProfile } from '@repo/shared'

type TabType = 'personal' | 'goals' | 'devices' | 'notifications' | 'security' | 'privacy'

interface TabConfig {
  id: TabType
  label: string
  isPro?: boolean
}

const tabs: TabConfig[] = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'goals', label: 'Fitness Goals' },
  { id: 'devices', label: 'Devices', isPro: true },
  { id: 'notifications', label: 'Notifications', isPro: true },
  { id: 'security', label: 'Security' },
  { id: 'privacy', label: 'Privacy' },
]

function ProBadge() {
  return (
    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
      PRO
    </span>
  )
}

function ProUpgradePrompt() {
  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 text-center space-y-4">
      <div>
        <h3 className="text-white font-bold mb-2">Upgrade to PRO</h3>
        <p className="text-gray-400 text-sm">
          Unlock premium features to enhance your fitness tracking experience
        </p>
      </div>
      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors">
        Upgrade Now
      </button>
    </div>
  )
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
      <span className="text-gray-300 font-medium">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-[#a3e635]' : 'bg-white/20'}`}
      >
        <div
          className={`absolute top-1 ${value ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all`}
        />
      </button>
    </div>
  )
}

export function ProfileView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { data: userGoals } = useUserGoals(user?.uid)
  const { data: bodyMetrics } = useLatestBodyMetrics(user?.uid)
  const [activeTab, setActiveTab] = useState<TabType>('personal')

  // Fetch user profile data
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null
      const docSnap = await getDoc(doc(db, 'userProfiles', user.uid))
      return (docSnap.data() as UserProfile) || null
    },
    enabled: !!user?.uid,
  })

  // Mutation for updating privacy settings
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      if (!user?.uid) throw new Error('User not authenticated')
      await setDoc(doc(db, 'userProfiles', user.uid), data, { merge: true })
    },
  })

  // Notifications State
  const [notifications, setNotifications] = useState({
    workoutReminders: false,
    activityReminder: false,
    emailNotifications: false,
    pushNotifications: false,
  })

  // Profile Visibility State - Convert to boolean for toggle
  const [isProfilePublic, setIsProfilePublic] = useState(
    userProfile?.profileVisibility === 'Public'
  )

  // Update profile visibility state when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setIsProfilePublic(userProfile.profileVisibility === 'Public')
    }
  }, [userProfile])

  // Personal Info - Combines Auth and Profile data
  const personal = {
    name: user?.displayName || userProfile?.name || 'Not set',
    email: user?.email || 'Not set',
    height: userProfile?.height || null,
    weight: bodyMetrics?.weight || null,
    gender: userProfile?.gender || null,
  }

  // Fitness Goals - From database
  const goals = {
    goal: userGoals?.goalType || 'Not set',
    weeklyTarget: userGoals?.weeklyWorkoutFrequencyTarget || 0,
    weeklyMinutes: userGoals?.weeklyWorkoutMinutes || 0,
    weeklyCalorieTarget: userGoals?.weeklyCalorieBurnTarget || 0,
    standGoal: userGoals?.dailyMoveTarget || 0,
    workoutPreferences: userGoals?.workoutPreferences || 'Not set',
  }

  // Handle close and save changes
  const handleClose = async () => {
    if (userProfile && isProfilePublic !== (userProfile.profileVisibility === 'Public')) {
      // Only save if there's a change
      await updateProfileMutation.mutateAsync({
        userId: user?.uid,
        profileVisibility: isProfilePublic ? 'Public' : 'Private',
      })
    }
    onBack()
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-white/70">Name</p>
              <p className="text-white font-semibold mt-1">{personal.name}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-white/70">Email</p>
              <p className="text-white font-semibold mt-1">{personal.email}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/70">Height</p>
                <p className="text-white font-semibold mt-1">
                  {personal.height ? `${personal.height} cm` : 'Not set'}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/70">Weight</p>
                <p className="text-white font-semibold mt-1">
                  {personal.weight ? `${personal.weight} kg` : 'Not set'}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/70">Gender</p>
                <p className="text-white font-semibold mt-1 capitalize">
                  {personal.gender || 'Not set'}
                </p>
              </div>
            </div>
            <p className="text-sm text-white/50 mt-4">
              To update your personal information, please visit your account settings or complete
              the onboarding process.
            </p>
          </motion.div>
        )

      case 'goals':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-white/70">Goal Type</p>
              <p className="text-white font-semibold mt-1 capitalize">
                {goals.goal.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/70">Workout Frequency</p>
                <p className="text-white font-semibold mt-1">{goals.weeklyTarget} times/week</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/70">Workout Target Minutes</p>
                <p className="text-white font-semibold mt-1">{goals.weeklyMinutes} min/week</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/70">Calorie Target</p>
                <p className="text-white font-semibold mt-1">
                  {goals.weeklyCalorieTarget} cal/week
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/70">Daily Stand Goal</p>
                <p className="text-white font-semibold mt-1">{goals.standGoal} steps</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-white/70">Workout Preference</p>
              <p className="text-white font-semibold mt-1 capitalize">{goals.workoutPreferences}</p>
            </div>
            <p className="text-sm text-white/50 mt-4">
              To update your fitness goals, please visit the goals section in your dashboard.
            </p>
          </motion.div>
        )

      case 'devices':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <ProUpgradePrompt />
            <div className="space-y-3 opacity-50 pointer-events-none">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Garmin</h3>
                  <p className="text-sm text-gray-400">Sync fitness data</p>
                </div>
                <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium">
                  Connect
                </button>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Google Fit</h3>
                  <p className="text-sm text-gray-400">Sync activity data</p>
                </div>
                <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium">
                  Connect
                </button>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Apple Health</h3>
                  <p className="text-sm text-gray-400">Sync health metrics</p>
                </div>
                <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium">
                  Connect
                </button>
              </div>
            </div>
          </motion.div>
        )

      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <ProUpgradePrompt />
            <div className="opacity-50 pointer-events-none">
              <ToggleField
                label="Workout Reminders"
                value={notifications.workoutReminders}
                onChange={value => setNotifications({ ...notifications, workoutReminders: value })}
              />
              <ToggleField
                label="Daily Activity Reminder"
                value={notifications.activityReminder}
                onChange={value => setNotifications({ ...notifications, activityReminder: value })}
              />
              <ToggleField
                label="Email Notifications"
                value={notifications.emailNotifications}
                onChange={value =>
                  setNotifications({ ...notifications, emailNotifications: value })
                }
              />
              <ToggleField
                label="Push Notifications"
                value={notifications.pushNotifications}
                onChange={value => setNotifications({ ...notifications, pushNotifications: value })}
              />
            </div>
          </motion.div>
        )

      case 'security':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors">
              <h3 className="font-bold text-white mb-1">Change Password</h3>
              <p className="text-sm text-gray-400">Update your account password</p>
            </button>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">Two-Factor Authentication</h3>
                  <ProBadge />
                </div>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
              >
                Disabled
              </button>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-white mb-1">Profile Visibility</h3>
                  <p className="text-sm text-gray-400">
                    Make your profile {isProfilePublic ? 'public' : 'private'}
                  </p>
                </div>
                <button
                  onClick={() => setIsProfilePublic(!isProfilePublic)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isProfilePublic ? 'bg-[#a3e635]' : 'bg-white/20'}`}
                >
                  <div
                    className={`absolute top-1 ${isProfilePublic ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isProfilePublic
                  ? 'Your profile is visible to everyone'
                  : 'Your profile is only visible to you'}
              </p>
            </div>
            <button className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors">
              <h3 className="font-bold text-white mb-1">Logout from All Devices</h3>
              <p className="text-sm text-gray-400">End all active sessions</p>
            </button>
          </motion.div>
        )

      case 'privacy':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button
              disabled
              className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-left opacity-50 cursor-not-allowed transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">Data Export</h3>
                    <ProBadge />
                  </div>
                  <p className="text-sm text-gray-400">Download your fitness data</p>
                </div>
                <span className="text-sm text-gray-500">Coming Soon</span>
              </div>
            </button>
            <button className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-left transition-colors">
              <h3 className="font-bold text-red-400">Delete Account</h3>
              <p className="text-sm text-red-300/70 mt-1">
                Permanently delete your account and all data
              </p>
            </button>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto pb-24 space-y-8"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-md py-4 -mx-4 px-4 flex items-center justify-between border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Profile</h1>
          <p className="text-gray-400 text-sm">Manage your account settings</p>
        </div>
        <button
          onClick={handleClose}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tab Container */}
      <div className="bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-white/5 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-[#a3e635] border-b-2 border-[#a3e635] bg-white/5'
                  : 'text-gray-400 border-b-2 border-transparent hover:text-gray-200'
              }`}
            >
              {tab.label}
              {tab.isPro && <ProBadge />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">{renderTabContent()}</div>
      </div>
    </motion.div>
  )
}
