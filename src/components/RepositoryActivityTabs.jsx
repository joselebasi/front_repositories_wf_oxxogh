import { useState } from 'react';
import RepositoryBranchesLastCommit from './RepositoryBranchesLastCommit';
import RepositoryOpenPullRequest from './RepositoryOpenPullRequest';

export default function RepositoryActivityTabs() {
    const [activeTab, setActiveTab] = useState('branches'); // 'branches' or 'prs'

    return (
        <div className="w-full space-y-6">
            {/* Tab Navigation */}
            <div className="flex justify-center">
                <div className="inline-flex p-1 bg-gray-100 dark:bg-[#404040] rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('branches')}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'branches'
                            ? 'bg-white dark:bg-[#303030] text-amber-600 dark:text-amber-400 shadow-md transform scale-105'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Actividad en Ramas
                    </button>
                    <button
                        onClick={() => setActiveTab('prs')}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'prs'
                            ? 'bg-white dark:bg-[#303030] text-amber-600 dark:text-amber-400 shadow-md transform scale-105'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Pull Requests Abiertos
                    </button>
                </div>
            </div>

            {/* Active View Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'branches' ? (
                    <RepositoryBranchesLastCommit />
                ) : (
                    <RepositoryOpenPullRequest />
                )}
            </div>
        </div>
    );
}
