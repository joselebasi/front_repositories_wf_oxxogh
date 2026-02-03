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

                        <svg width="20px" height="20px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
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

                        <svg width="20px" height="20px" viewBox="0 0 64 64" id="i-github" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path strokeWidth="0" fill="currentColor" d="M32 0 C14 0 0 14 0 32 0 53 19 62 22 62 24 62 24 61 24 60 L24 55 C17 57 14 53 13 50 13 50 13 49 11 47 10 46 6 44 10 44 13 44 15 48 15 48 18 52 22 51 24 50 24 48 26 46 26 46 18 45 12 42 12 31 12 27 13 24 15 22 15 22 13 18 15 13 15 13 20 13 24 17 27 15 37 15 40 17 44 13 49 13 49 13 51 20 49 22 49 22 51 24 52 27 52 31 52 42 45 45 38 46 39 47 40 49 40 52 L40 60 C40 61 40 62 42 62 45 62 64 53 64 32 64 14 50 0 32 0 Z" />
                        </svg>
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
                                <g id="icon" fill="currentColor" transform="translate(64.000000, 64.000000)">
                                    <path d="M42.6666667,1.42108547e-14 L42.666,341.333 L384,341.333333 L384,384 L1.42108547e-14,384 L1.42108547e-14,1.42108547e-14 L42.6666667,1.42108547e-14 Z M290.80086,91.7065484 L382.469976,176.324193 L353.530024,207.675807 L306.517333,164.288 L263.90925,265.523605 L197.653333,204.8 L140.664173,309.333333 L64,309.333333 L64,266.666667 L115.328,266.666667 L186.323324,136.522922 L248.085333,193.130667 L290.80086,91.7065484 Z" id="Combined-Shape">

                                    </path>
                                </g>
                            </g>
                        </svg>
                        Threshold Repositorios
                    </button>
                    <button
                        onClick={() => setActiveTab('workflows')}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'workflows'
                            ? 'bg-white dark:bg-[#303030] text-amber-600 dark:text-amber-400 shadow-md transform scale-105'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
                            }`}
                    >
                        <svg width="20px" height="20px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><title>GitHub Actions icon</title><path d="M10.984 13.836a.5.5 0 0 1-.353-.146l-.745-.743a.5.5 0 1 1 .706-.708l.392.391 1.181-1.18a.5.5 0 0 1 .708.707l-1.535 1.533a.504.504 0 0 1-.354.146zm9.353-.147l1.534-1.532a.5.5 0 0 0-.707-.707l-1.181 1.18-.392-.391a.5.5 0 1 0-.706.708l.746.743a.497.497 0 0 0 .706-.001zM4.527 7.452l2.557-1.585A1 1 0 0 0 7.09 4.17L4.533 2.56A1 1 0 0 0 3 3.406v3.196a1.001 1.001 0 0 0 1.527.85zm2.03-2.436L4 6.602V3.406l2.557 1.61zM24 12.5c0 1.93-1.57 3.5-3.5 3.5a3.503 3.503 0 0 1-3.46-3h-2.08a3.503 3.503 0 0 1-3.46 3 3.502 3.502 0 0 1-3.46-3h-.558c-.972 0-1.85-.399-2.482-1.042V17c0 1.654 1.346 3 3 3h.04c.244-1.693 1.7-3 3.46-3 1.93 0 3.5 1.57 3.5 3.5S13.43 24 11.5 24a3.502 3.502 0 0 1-3.46-3H8c-2.206 0-4-1.794-4-4V9.899A5.008 5.008 0 0 1 0 5c0-2.757 2.243-5 5-5s5 2.243 5 5a5.005 5.005 0 0 1-4.952 4.998A2.482 2.482 0 0 0 7.482 12h.558c.244-1.693 1.7-3 3.46-3a3.502 3.502 0 0 1 3.46 3h2.08a3.503 3.503 0 0 1 3.46-3c1.93 0 3.5 1.57 3.5 3.5zm-15 8c0 1.378 1.122 2.5 2.5 2.5s2.5-1.122 2.5-2.5-1.122-2.5-2.5-2.5S9 19.122 9 20.5zM5 9c2.206 0 4-1.794 4-4S7.206 1 5 1 1 2.794 1 5s1.794 4 4 4zm9 3.5c0-1.378-1.122-2.5-2.5-2.5S9 11.122 9 12.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5zm9 0c0-1.378-1.122-2.5-2.5-2.5S18 11.122 18 12.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5zm-13 8a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0zm2 0a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0zm12 0c0 1.93-1.57 3.5-3.5 3.5a3.503 3.503 0 0 1-3.46-3.002c-.007.001-.013.005-.021.005l-.506.017h-.017a.5.5 0 0 1-.016-.999l.506-.017c.018-.002.035.006.052.007A3.503 3.503 0 0 1 20.5 17c1.93 0 3.5 1.57 3.5 3.5zm-1 0c0-1.378-1.122-2.5-2.5-2.5S18 19.122 18 20.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5z" /></svg>
                        Workflow Repositorios
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
