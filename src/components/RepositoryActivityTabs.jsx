import { useState } from 'react';
import RepositoryBranchesLastCommit from './RepositoryBranchesLastCommit';
import RepositoryOpenPullRequest from './RepositoryOpenPullRequest';
import RepositoryThresholdLastUpdate from './RepositoryThresholdLastUpdate';
import RepositoryWorkflowsActivity from './RepositoryWorkflowsActivity';

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

                        <svg width="20px" height="20px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <title>branch</title>
                            <g id="Layer_2" data-name="Layer 2">
                                <g id="invisible_box" data-name="invisible box">
                                    <rect width="48" height="48" fill="none" />
                                </g>
                                <g id="icons_Q2" data-name="icons Q2">
                                    <path d="M44,9a7,7,0,1,0-9,6.7V16a6,6,0,0,1-6,6H21a10.3,10.3,0,0,0-6,2V15.7a7,7,0,1,0-4,0V32.3a7,7,0,1,0,4,0V32a6,6,0,0,1,6-6h8A10,10,0,0,0,39,16v-.3A7,7,0,0,0,44,9ZM10,9a3,3,0,0,1,6,0,3,3,0,0,1-6,0Zm6,30a3,3,0,1,1-3-3A2.9,2.9,0,0,1,16,39ZM37,12a2.9,2.9,0,0,1-3-3,3,3,0,0,1,6,0A2.9,2.9,0,0,1,37,12Z" />
                                </g>
                            </g>
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

                        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 8.83a3.001 3.001 0 1 0-2 0v6.34a3.001 3.001 0 1 0 2 0V8.83ZM6 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM17 15.17a3.001 3.001 0 1 0 2 0V10.4A5.4 5.4 0 0 0 13.6 5h-.186l.293-.293a1 1 0 0 0-1.414-1.414l-2 2a1 1 0 0 0 0 1.414l2 2a1 1 0 1 0 1.414-1.414L13.414 7h.186a3.4 3.4 0 0 1 3.4 3.4v4.77ZM17 18a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="#000000" /></svg>
                        Pull Requests Abiertos
                    </button>
                    <button
                        onClick={() => setActiveTab('thresholds')}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'thresholds'
                            ? 'bg-white dark:bg-[#303030] text-amber-600 dark:text-amber-400 shadow-md transform scale-105'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
                            }`}
                    >

                        <svg width="20px" height="20px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <title>threshold-off</title>
                            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="icon" fill="#000000" transform="translate(64.000000, 64.000000)">
                                    <path d="M42.6666667,1.42108547e-14 L42.666,341.333 L384,341.333333 L384,384 L1.42108547e-14,384 L1.42108547e-14,1.42108547e-14 L42.6666667,1.42108547e-14 Z M290.80086,91.7065484 L382.469976,176.324193 L353.530024,207.675807 L306.517333,164.288 L263.90925,265.523605 L197.653333,204.8 L140.664173,309.333333 L64,309.333333 L64,266.666667 L115.328,266.666667 L186.323324,136.522922 L248.085333,193.130667 L290.80086,91.7065484 Z" id="Combined-Shape">

                                    </path>
                                </g>
                            </g>
                        </svg>
                        Threshold repositorios
                    </button>
                    <button
                        onClick={() => setActiveTab('workflows')}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'workflows'
                            ? 'bg-white dark:bg-[#303030] text-amber-600 dark:text-amber-400 shadow-md transform scale-105'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
                            }`}
                    >

                        <svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="#000000" fill-rule="evenodd" d="M2.75 2.5A1.75 1.75 0 001 4.25v1C1 6.216 1.784 7 2.75 7h1a1.75 1.75 0 001.732-1.5H6.5a.75.75 0 01.75.75v3.5A2.25 2.25 0 009.5 12h1.018c.121.848.85 1.5 1.732 1.5h1A1.75 1.75 0 0015 11.75v-1A1.75 1.75 0 0013.25 9h-1a1.75 1.75 0 00-1.732 1.5H9.5a.75.75 0 01-.75-.75v-3.5A2.25 2.25 0 006.5 4H5.482A1.75 1.75 0 003.75 2.5h-1zM2.5 4.25A.25.25 0 012.75 4h1a.25.25 0 01.25.25v1a.25.25 0 01-.25.25h-1a.25.25 0 01-.25-.25v-1zm9.75 6.25a.25.25 0 00-.25.25v1c0 .138.112.25.25.25h1a.25.25 0 00.25-.25v-1a.25.25 0 00-.25-.25h-1z" clip-rule="evenodd" /></svg>
                        Workflow repositorios
                    </button>
                </div>
            </div>

            {/* Active View Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'branches' ? (
                    <RepositoryBranchesLastCommit />
                ) : activeTab === 'prs' ? (
                    <RepositoryOpenPullRequest />
                ) : activeTab === 'thresholds' ? (
                    <RepositoryThresholdLastUpdate />
                ) : (
                    <RepositoryWorkflowsActivity />
                )}
            </div>
        </div>
    );
}
