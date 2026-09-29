export const en = {
    common: {
        actions: 'Actions',
        active: 'Active',
        admin: 'Admin',
        backToDashboard: 'Back to dashboard',
        cancel: 'Cancel',
        candidate: 'Candidate',
        clearFilters: 'Clear filters',
        close: 'Close',
        confirmDeleteTitle: 'Confirm deletion',
        created: 'Created',
        dashboard: 'Dashboard',
        delete: 'Delete',
        deleted: 'Deleted',
        edit: 'Edit',
        email: 'Email',
        employmentType: 'Employment type',
        findJobs: 'Find jobs',
        from: 'From',
        language: 'Language',
        location: 'Location',
        login: 'Login',
        logout: 'Logout',
        name: 'Name',
        next: 'Next',
        notSpecified: 'Not specified',
        of: 'of',
        page: 'Page',
        pending: 'Pending',
        preferred: 'Preferred',
        previous: 'Previous',
        profile: 'Profile',
        recruiter: 'Recruiter',
        refresh: 'Refresh',
        register: 'Register',
        required: 'Required',
        role: 'Role',
        salary: 'Salary',
        save: 'Save',
        saving: 'Saving...',
        search: 'Search',
        skill: 'Skill',
        status: 'Status',
        suspended: 'Suspended',
        tryAgain: 'Try again',
        upTo: 'Up to',
        workMode: 'Work mode',
    },

    accessibility: {
        skipToMainContent: 'Skip to main content',
        mainNavigation: 'Main navigation',
    },

    adminUsers: {
        title: 'Admin — User Management',
        loading: 'Loading users...',
        loadError: 'Failed to load users.',
        updateError: 'Failed to update user.',
        deleteError: 'Failed to delete user.',
        noUsers: 'No users found',
        editUser: 'Edit user',
        deleteConfirmation: 'Are you sure you want to delete this user?',
    },

    adminSkills: {
        category: 'Category',
        description: 'Description',
        title: 'Admin — Skills Management',
        loading: 'Loading skills...',
        loadError: 'Failed to load skills.',
        createError: 'Failed to create skill.',
        updateError: 'Failed to update skill.',
        deleteError: 'Failed to delete skill.',
        skillInUseError: 'Skill cannot be deleted because it is still in use.',
        duplicateSlug: 'A skill with this slug already exists.',
        noSkills: 'No skills found',
        noSkillsMatch: 'No skills match your search.',
        searchPlaceholder: 'Search skills...',
        createSkill: 'Create skill',
        editSkill: 'Edit skill',
        deleteSkill: 'Delete skill',
        nameRequired: 'Name is required.',
        slugRequired: 'Slug is required.',
        categoryRequired: 'Category is required.',
        deleteConfirmation: 'Are you sure you want to delete this skill?',

        categories: {
            frontend: 'Frontend',
            backend: 'Backend',
            fullstack: 'Fullstack',
            mobile: 'Mobile',
            devops: 'DevOps',
            cloud: 'Cloud',
            data: 'Data',
            aiMl: 'AI / ML',
            security: 'Security',
            database: 'Database',
            testing: 'Testing',
            projectManagement: 'Project Management',
            design: 'Design',
            other: 'Other',
        },
    },

    auth: {
        password: 'Password',
        accountType: 'Account type',
        emailRequired: 'Email is required.',
        invalidEmail: 'Please enter a valid email address.',
        passwordMinLength: 'Password must be at least 8 characters.',
        loginFailed: 'Login failed.',
        loggingIn: 'Logging in...',
        registrationFailed: 'Registration failed.',
        creatingAccount: 'Creating account...',
        accountNotActive: 'Account is not active.',
    },

    candidateJobs: {
        eyebrow: 'Candidate',
        title: 'Find your next opportunity',
        description: 'Search published jobs and filter them by your preferences.',
        searchJobs: 'Search jobs',
        searchPlaceholder: 'Title, description or company',
        locationPlaceholder: 'Amsterdam',
        allWorkModes: 'All work modes',
        allEmploymentTypes: 'All employment types',
        minimumSalary: 'Minimum salary',
        maximumSalary: 'Maximum salary',
        sort: 'Sort',
        newest: 'Newest',
        titleSort: 'Title',
        skills: 'Skills',
        loadingSkills: 'Loading skills...',
        noSkills: 'No skills available.',
        fullTime: 'Full-time',
        partTime: 'Part-time',
        contract: 'Contract',
        freelance: 'Freelance',
        internship: 'Internship',
        remote: 'Remote',
        hybrid: 'Hybrid',
        onsite: 'On-site',
        flexible: 'Flexible',
        unableToLoadJobs: 'Unable to load jobs',
        loadError: 'Unable to load jobs. Please try again.',
        invalidSearch:
            'The search request is invalid. Please check your filters.',
        loadingJobs: 'Loading jobs...',
        noJobsFound: 'No jobs found',
        noJobsMatch:
            'No published jobs match your current search and filters.',
        jobsFound: 'jobs found',
        jobFound: 'job found',
        loadingPage: 'Loading page...',
        published: 'Published',
        viewJob: 'View job',
        pagination: 'Job results pagination',
        allSkills: 'All skills',
        searchSkillsPlaceholder: 'Search skills...',
        noSkillsFound: 'No skills found.',
        workModesSelected: 'work modes',
        employmentTypesSelected: 'employment types',
    },

    candidateApplications: {
        eyebrow: 'Candidate',
        title: 'My applications',
        description:
            'Track the applications you have submitted and view their current status.',

        loading: 'Loading applications...',

        accessDenied: 'Access denied',
        unauthorized:
            'You are not authorized to view your applications.',
        applicationsNotFound: 'Applications not found',
        notFoundDescription:
            'We could not find your applications right now.',
        unableToLoad: 'Unable to load applications',
        loadError:
            'Something went wrong while loading your applications. Please try again.',

        noApplications: 'No applications yet',
        noApplicationsDescription:
            'You have not applied for any jobs yet. Explore available jobs to find your next opportunity.',
        browseJobs: 'Browse jobs',

        application: 'application',
        applications: 'applications',

        reviewing: 'Reviewing',
        accepted: 'Accepted',
        rejected: 'Rejected',
        withdrawn: 'Withdrawn',

        applied: 'Applied',
        coverLetterSubmitted: 'Cover letter submitted',
        viewApplication: 'View application',

        details: {
            loading: 'Loading application...',
            accessDenied: 'Access denied',
            applicationNotFound: 'Application not found',
            unableToLoad: 'Unable to load application',
            unauthorized:
                'You are not authorized to view this application.',
            notFound:
                'The application could not be found or is no longer available.',
            loadError:
                'Something went wrong while loading this application. Please try again later.',

            backToApplications: 'Back to applications',
            eyebrow: 'Candidate application',
            jobDetails: 'Job details',
            applicationDetails: 'Application details',
            applied: 'Applied',
            lastUpdated: 'Last updated',
            coverLetter: 'Cover letter',
            withdrawApplication: 'Withdraw application',
            withdrawDescription:
                'You can withdraw your application while it is still being processed.',
            withdrawing: 'Withdrawing...',
            withdrawConfirmation:
                'Are you sure you want to withdraw this application?',
            withdrawUnauthorized:
                'You are not authorized to withdraw this application.',
            withdrawNotFound:
                'The application could not be found.',
            withdrawError:
                'Unable to withdraw the application. Please try again.',
        },
    },

    candidateJobDetails: {
        loading: 'Loading job...',
        jobNotFound: 'Job not found',
        unableToLoad: 'Unable to load job',
        jobUnavailable:
            'This job is no longer available or could not be found.',
        loadError:
            'Something went wrong while loading this job. Please try again.',
        backToJobs: 'Back to jobs',
        jobOpportunity: 'Job opportunity',
        aboutTheJob: 'About the job',
        applyForThisJob: 'Apply for this job',
        applicationSubmitted: 'Application submitted',
        applicationSuccess:
            'You have successfully applied for this job.',
        alreadyApplied: 'Already applied',
        alreadyAppliedDescription:
            'You have already applied for this job.',
        viewMyApplications: 'View my applications',
        submitApplication:
            'Submit your application for this position.',
        coverLetter: 'Cover letter',
        optional: 'optional',
        coverLetterPlaceholder:
            'Tell the recruiter why you are a good fit for this role...',
        submitting: 'Submitting...',
        applyNow: 'Apply now',
        submitError:
            'Unable to submit your application. Please try again.',
        submitUnexpectedError:
            'Something went wrong while submitting your application.',
        requiredSkills: 'Required skills',
        noRequiredSkills: 'No required skills specified.',
        preferredSkills: 'Preferred skills',
        noPreferredSkills: 'No preferred skills specified.',
        minimumLevel: 'Minimum level',
        company: 'Company',
        website: 'Website',
        published: 'Published',
        expires: 'Expires',
    },

    dashboard: {
        loading: 'Loading dashboard...',
        unavailable: 'Dashboard unavailable',
        loadError: 'Unable to load the dashboard. Please try again.',
        retry: 'Retry',
        title: 'Dashboard',
        eyebrow: 'IT Talent Dashboard',
        welcomeBack: 'Welcome back',
        viewProfile: 'View profile',

        candidate: {
            dashboardLabel: 'Candidate dashboard',
            complete: 'complete',
            editProfile: 'Edit profile',
            applications: 'Applications',
            totalApplications: 'Total applications',
            viewApplications: 'View applications',
            availableJobs: 'Available jobs',
            recommended: 'recommended',
            browseJobs: 'Browse jobs',
            skills: 'Skills',
            skillsInProfile: 'Skills in your profile',
            manageProfile: 'Manage profile',
            applicationOverview: 'Application overview',
            applicationsByStatus: 'Applications by status',
            recentApplications: 'Recent applications',
            latestApplications: 'Your latest applications',
            viewAll: 'View all',
            noApplications:
                'You have not submitted any applications yet.',
            recentJobs: 'Recent jobs',
            latestOpportunities: 'Latest opportunities',
            browseAll: 'Browse all',
            noJobs:
                'No published jobs are currently available.',
        },

        recruiter: {
            dashboardLabel: 'Recruiter dashboard',
            company: 'Company',
            noCompany: 'No company',
            manageCompany: 'Manage company',
            jobs: 'Jobs',
            published: 'published',
            draft: 'draft',
            closed: 'closed',
            manageJobs: 'Manage jobs',
            applications: 'Applications',
            totalApplications: 'Total applications',
            viewApplications: 'View applications',
            editProfile: 'Edit profile',
            applicationOverview: 'Application overview',
            applicationsByStatus: 'Applications by status',
            recentApplications: 'Recent applications',
            latestCandidates: 'Latest candidates',
            noApplications:
                'No applications have been received yet.',
            recentJobs: 'Recent jobs',
            latestVacancies: 'Latest vacancies',
            noJobs: 'No jobs have been created yet.',
            viewAll: 'View all',
        },

        admin: {
            administration: 'Administration',
            tools: 'Admin tools',
            description:
                'Manage users and platform administration.',
            manageUsers: 'Manage users',
            manageSkills: 'Manage skills',
        },
        account: {
            account: 'Account',
            yourAccount: 'Your account',
        },
    },

    errors: {
        pageNotFound: 'Page not found',
    },

    feedback: {
        somethingWentWrong: 'Something went wrong',
        loading: 'Loading...',
    },

    landing: {
        title: 'IT Talent',
        eyebrow: 'IT Talent Platform',
        subtitle:
            'Connect talent with the right IT opportunities.',
        description:
            'IT Talent helps candidates and recruiters connect through a focused platform for the IT job market.',
        goToDashboard: 'Go to dashboard',
        getStarted: 'Get started',

        candidates: {
            label: 'For candidates',
            title: 'Build your IT career',
            description:
                'Create your profile and present your skills and experience to potential employers.',
            createAccount: 'Create your account',
        },

        recruiters: {
            label: 'For recruiters',
            title: 'Find IT talent',
            description:
                'Build your recruiter profile and connect with professionals for your hiring needs.',
            getStarted: 'Get started',
        },
    },

    profile: {
        account: 'Account',
        title: 'Profile',
        accountInformation: 'Account information',
        firstName: 'First name',
        lastName: 'Last name',
        editAccount: 'Edit account',
        saveAccount: 'Save account',
        candidateProfile: 'Candidate profile',
        createCandidateProfile: 'Create candidate profile',
        editProfile: 'Edit profile',
        loading: 'Loading candidate profile...',
        profileUnavailable: 'Profile unavailable',
        headline: 'Headline',
        summary: 'Summary',
        minimumSalary: 'Minimum salary',
        maximumSalary: 'Maximum salary',
        currency: 'Currency',
        availabilityDate: 'Availability date',
        availability: 'Availability',
        remotePreference: 'Remote preference',
        saveProfile: 'Save profile',
        createProfile: 'Create profile',
        profileUpdated: 'Profile updated successfully.',
        profileCreated: 'Profile created successfully.',
        accountUpdated: 'Account information updated successfully.',
        unauthorizedAccess:
            'You are not authorized to access your candidate profile.',
        serverLoadError:
            'The server encountered an error while loading your candidate profile.',
        connectionError:
            'Unable to connect to the server. Please check your connection and try again.',
        loadError:
            'Unable to load your candidate profile.',
        unauthorizedModify:
            'You are not authorized to modify your candidate profile.',
        invalidInformation:
            'Please check your profile information and try again.',
        invalidAccountInformation:
            'Please check your first and last name and try again.',
        profileAlreadyExists:
            'A candidate profile already exists.',
        processingError:
            'The profile information could not be processed. Please check your input.',
        serverError:
            'The server encountered an error. Please try again later.',
        updateError:
            'Unable to update your candidate profile.',
        createError:
            'Unable to create your candidate profile.',
        accountUpdateError:
            'Unable to update your account information.',
        recruiterInformation: 'Recruiter information',
        recruiterLoading: 'Loading recruiter profile...',
        recruiterUnavailable: 'Recruiter profile unavailable',
        recruiterLoadError: 'Unable to load recruiter profile.',
        recruiterUpdated: 'Recruiter profile saved.',
        recruiterUpdateError: 'Unable to save recruiter profile.',
        jobTitle: 'Job title',
        jobTitlePlaceholder: 'e.g. Senior Recruiter',
        saveRecruiterProfile: 'Save profile',
    },

    recruiterJobs: {
        title: 'Jobs',
        description: "Manage your company's job vacancies.",
        newJob: 'New Job',
        loading: 'Loading jobs...',
        loadError: 'Unable to load your jobs. Please try again.',
        noJobs: 'No jobs yet',
        noJobsDescription: 'Create your first job vacancy to start recruiting.',
        createFirstJob: 'Create your first job',
        yourJobs: 'Your jobs',
        locationNotSpecified: 'Location not specified',
        salaryNotSpecified: 'Salary not specified',
        fullTime: 'Full-time',
        partTime: 'Part-time',
        contract: 'Contract',
        freelance: 'Freelance',
        internship: 'Internship',
        remote: 'Remote',
        hybrid: 'Hybrid',
        onsite: 'On-site',
        flexible: 'Flexible',
        draft: 'Draft',
        published: 'Published',
        paused: 'Paused',
        closed: 'Closed',
        view: 'View',
        jobNotFound: 'Job not found.',
        jobIdMissing: 'Job ID is missing.',
        unableToLoadDetails: 'Unable to load this job.',
        backToJobs: 'Back to jobs',
        publish: 'Publish job',
        publishing: 'Publishing...',
        pause: 'Pause job',
        pausing: 'Pausing...',
        resume: 'Resume job',
        resuming: 'Resuming...',
        close: 'Close job',
        closing: 'Closing...',
        reopen: 'Reopen job',
        reopening: 'Reopening...',
        publishedSuccessfully: 'Job published successfully.',
        pausedSuccessfully: 'Job paused successfully.',
        resumedSuccessfully: 'Job resumed successfully.',
        closedSuccessfully: 'Job closed successfully.',
        reopenedSuccessfully: 'Job reopened successfully.',
        publishError: 'Unable to publish this job. Please try again.',
        pauseError: 'Unable to pause this job. Please try again.',
        resumeError: 'Unable to resume this job. Please try again.',
        closeError: 'Unable to close this job. Please try again.',
        reopenError: 'Unable to reopen this job. Please try again.',
        jobDescription: 'Job description',
        jobInformation: 'Job information',
        expirationDate: 'Expiration date',
        requirements: 'Requirements',
        requirementsDescription: 'Skills required or preferred for this position.',
        manageRequirements: 'Manage requirements',
        noRequirements: 'No requirements configured.',
        requiredSkills: 'Required skills',
        preferredSkills: 'Preferred skills',
        minimumLevel: 'Minimum level',
        jobDetails: 'Job details',
        jobTitle: 'Job title',
        titleRequired: 'Title is required.',
        descriptionRequired: 'Description is required.',
        descriptionPlaceholder: 'Describe the role, responsibilities and expectations...',
        jobTitlePlaceholder: 'e.g. Senior Frontend Developer',
        locationPlaceholder: 'e.g. Amsterdam, Netherlands',
        salaryExpiration: 'Salary & expiration',
        salaryMin: 'Minimum salary',
        salaryMax: 'Maximum salary',
        currency: 'Currency',
        jobRequirements: 'Job requirements',
        jobRequirementsDescription: 'Add the skills candidates should have.',
        selectSkill: 'Select a skill',
        type: 'Type',
        addRequirement: 'Add requirement',
        unknownSkill: 'Unknown skill',
        loadingRequirements: 'Loading requirements...',
        noRequirementsAddedYet: 'No requirements added yet.',
        noRequirementsHaveBeenAdded: 'No requirements have been added yet.',
        requirementsWillBeCreated: 'These requirements will be created through the Requirements API when you save the job.',
        editJob: 'Edit job',
        createJob: 'Create job',
        updateJobDescription: 'Update the details of your job vacancy.',
        createJobDescription: 'Create a new job vacancy for your company.',
        saveChanges: 'Save changes',
        loadSkillsError: 'Unable to load skills.',
        loadJobError: 'Unable to load the job.',
        loadRequirementsError: 'Unable to load job requirements.',
        selectSkillError: 'Please select a skill.',
        validSkillError: 'Please select a valid skill.',
        minimumLevelRangeError:
            'Minimum level must be between 1 and 5.',
        duplicateSkillError:
            'This skill has already been added.',
        addRequirementError:
            'Unable to add the requirement.',
        updateRequirementError:
            'Unable to update the requirement.',
        deleteRequirementError:
            'Unable to delete the requirement.',
        validEmploymentTypeError:
            'Please select a valid employment type.',
        validWorkModeError:
            'Please select a valid work mode.',
        minimumSalaryNegative:
            'Minimum salary cannot be negative.',
        maximumSalaryNegative:
            'Maximum salary cannot be negative.',
        salaryRangeError:
            'Minimum salary cannot be greater than maximum salary.',
        expirationPastError:
            'Expiration date cannot be in the past.',
        invalidSkillIds:
            'One or more skill IDs are invalid.',
        minimumSkillLevelError:
            'Minimum skill level must be between 1 and 5.',
        jobCreatedRequirementsError:
            'The job was created, but one or more requirements could not be saved.',
        updateJobError: 'Unable to update the job.',
        createJobError: 'Unable to create the job.',
    },

    recruiterJobDetails: {
        loading: 'Loading job...',
    },

    recruiterJobForm: {
        loading: 'Loading job...',
        backToJobs: 'Back to jobs',

        editTitle: 'Edit job',
        createTitle: 'Create job',

        editDescription:
            'Update the details of your job vacancy.',
        createDescription:
            'Create a new job vacancy for your company.',

        jobDetails: 'Job details',
        jobTitle: 'Job title',
        jobTitlePlaceholder:
            'e.g. Senior Frontend Developer',

        locationPlaceholder:
            'e.g. Amsterdam, Netherlands',

        description: 'Description',
        descriptionPlaceholder:
            'Describe the role, responsibilities and expectations...',

        salaryAndExpiration: 'Salary & expiration',
        minimumSalary: 'Minimum salary',
        maximumSalary: 'Maximum salary',
        currency: 'Currency',
        expirationDate: 'Expiration date',

        jobRequirements: 'Job requirements',
        requirementsDescription:
            'Add the skills candidates should have.',
        selectSkill: 'Select a skill',
        type: 'Type',
        minimumLevel: 'Minimum level',
        addRequirement: 'Add requirement',
        loadingRequirements: 'Loading requirements...',
        noRequirementsYet: 'No requirements added yet.',
        noRequirementsAdded:
            'No requirements have been added yet.',
        requirementsWillBeCreated:
            'These requirements will be created through the Requirements API when you save the job.',
        noSkillsFound: 'No skills found',
        saveChanges: 'Save changes',
        createJob: 'Create job',

        unknownSkill: 'Unknown skill',

        unableToLoadSkills: 'Unable to load skills.',
        unableToLoadJob: 'Unable to load the job.',
        unableToLoadRequirements:
            'Unable to load job requirements.',

        selectSkillError:
            'Please select a skill.',
        invalidSkillError:
            'Please select a valid skill.',
        minimumLevelError:
            'Minimum level must be between 1 and 5.',
        duplicateSkillError:
            'This skill has already been added.',

        unableToAddRequirement:
            'Unable to add the requirement.',
        unableToUpdateRequirement:
            'Unable to update the requirement.',
        unableToDeleteRequirement:
            'Unable to delete the requirement.',

        titleRequired: 'Title is required.',
        descriptionRequired:
            'Description is required.',

        invalidEmploymentType:
            'Please select a valid employment type.',
        invalidWorkMode:
            'Please select a valid work mode.',

        minimumSalaryNegative:
            'Minimum salary cannot be negative.',
        maximumSalaryNegative:
            'Maximum salary cannot be negative.',
        minimumSalaryGreater:
            'Minimum salary cannot be greater than maximum salary.',

        expirationPast:
            'Expiration date cannot be in the past.',

        invalidSkillIds:
            'One or more skill IDs are invalid.',
        minimumSkillLevel:
            'Minimum skill level must be between 1 and 5.',

        jobCreatedRequirementsFailed:
            'The job was created, but one or more requirements could not be saved.',

        unableToUpdateJob:
            'Unable to update the job.',
        unableToCreateJob:
            'Unable to create the job.',
    },

    recruiterApplications: {
        eyebrow: 'Recruiter',
        title: 'Applications',
        description:
            'Review applications submitted to your job postings.',
        loading: 'Loading applications...',
        accessDenied: 'Access denied',
        unauthorized:
            'You are not authorized to view recruiter applications.',
        unableToLoad: 'Unable to load applications',
        loadError:
            'Something went wrong while loading applications. Please try again later.',
        filters: 'Application filters',
        job: 'Job',
        allJobs: 'All jobs',
        allStatuses: 'All statuses',
        reviewing: 'Reviewing',
        accepted: 'Accepted',
        rejected: 'Rejected',
        withdrawn: 'Withdrawn',
        noApplications: 'No applications found',
        noApplicationsMatch:
            'No applications match the selected filters.',

        applied: 'Applied',
        coverLetterIncluded: 'Cover letter included',

        details: {
            loading: 'Loading application...',
            accessDenied: 'Access denied',
            applicationNotFound: 'Application not found',
            unableToLoad: 'Unable to load application',

            unauthorized:
                'You are not authorized to view this application.',
            notFound:
                'The application could not be found.',
            loadError:
                'Something went wrong while loading this application.',
            backToApplications: 'Back to applications',
            eyebrow: 'Recruiter application',
            application: 'Application',
            applied: 'Applied',
            lastUpdated: 'Last updated',
            coverLetter: 'Cover letter',
            updateStatus: 'Update status',
            accept: 'Accept',
            reject: 'Reject',
            updatingStatus: 'Updating status...',
            updateUnauthorized:
                'You are not authorized to update this application.',
            invalidStatus:
                'This application status is not valid.',
            updateError:
                'Unable to update the application status.',
        },
    },
} as const;