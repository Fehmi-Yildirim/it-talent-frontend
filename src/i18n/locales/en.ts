export const en = {
    navigation: {
        dashboard: 'Dashboard',
        findJobs: 'Find jobs',
        login: 'Login',
        language: 'Language',
        logout: 'Logout',
        profile: 'Profile',
        register: 'Register',
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
        refresh: 'Refresh',
        noUsers: 'No users found',

        email: 'Email',
        role: 'Role',
        status: 'Status',
        created: 'Created',
        actions: 'Actions',

        candidate: 'Candidate',
        recruiter: 'Recruiter',
        admin: 'Admin',

        active: 'Active',
        pending: 'Pending',
        suspended: 'Suspended',
        deleted: 'Deleted',

        saving: 'Saving...',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',

        deleteConfirmation:
            'Are you sure you want to delete this user?',
    },

    auth: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        accountType: 'Account type',
        candidate: 'Candidate',
        recruiter: 'Recruiter',
        emailRequired: 'Email is required.',
        invalidEmail: 'Please enter a valid email address.',
        passwordMinLength: 'Password must be at least 8 characters.',
        loginFailed: 'Login failed.',
        loggingIn: 'Logging in...',
        registrationFailed: 'Registration failed.',
        creatingAccount: 'Creating account...',
        accountNotActive: 'Account is not active.',
    },

    buttons: {
        save: 'Save',
        cancel: 'Cancel',
    },

    candidateJobs: {
        eyebrow: 'Candidate',
        title: 'Find your next opportunity',
        description:
            'Search published jobs and filter them by your preferences.',

        searchJobs: 'Search jobs',
        search: 'Search',
        searchPlaceholder: 'Title, description or company',
        location: 'Location',
        locationPlaceholder: 'Amsterdam',
        workMode: 'Work mode',
        allWorkModes: 'All work modes',
        employmentType: 'Employment type',
        allEmploymentTypes: 'All employment types',
        minimumSalary: 'Minimum salary',
        maximumSalary: 'Maximum salary',
        sort: 'Sort',

        newest: 'Newest',
        salary: 'Salary',
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

        clearFilters: 'Clear filters',

        unableToLoadJobs: 'Unable to load jobs',
        loadError: 'Unable to load jobs. Please try again.',
        invalidSearch:
            'The search request is invalid. Please check your filters.',
        tryAgain: 'Try again',
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
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of',

        from: 'From',
        upTo: 'Up to',
        notSpecified: 'Not specified',
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
        tryAgain: 'Try again',

        noApplications: 'No applications yet',
        noApplicationsDescription:
            'You have not applied for any jobs yet. Explore available jobs to find your next opportunity.',
        browseJobs: 'Browse jobs',

        application: 'application',
        applications: 'applications',

        pending: 'Pending',
        reviewing: 'Reviewing',
        accepted: 'Accepted',
        rejected: 'Rejected',
        withdrawn: 'Withdrawn',

        applied: 'Applied',
        coverLetterSubmitted: 'Cover letter submitted',
        viewApplication: 'View application',

        backToDashboard: 'Back to dashboard',

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
            location: 'Location',
            workMode: 'Work mode',
            employmentType: 'Employment type',

            applicationDetails: 'Application details',
            status: 'Status',
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
        tryAgain: 'Try again',
        backToJobs: 'Back to jobs',

        jobOpportunity: 'Job opportunity',
        location: 'Location',
        workMode: 'Work mode',
        employmentType: 'Employment type',
        salary: 'Salary',

        notSpecified: 'Not specified',
        from: 'From',
        upTo: 'Up to',

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
        name: 'Name',
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
            profile: 'Profile',
            complete: 'complete',
            status: 'Status',
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
            status: 'Status',
            manageCompany: 'Manage company',
            jobs: 'Jobs',
            published: 'published',
            draft: 'draft',
            closed: 'closed',
            manageJobs: 'Manage jobs',
            applications: 'Applications',
            totalApplications: 'Total applications',
            viewApplications: 'View applications',
            recruiter: 'Recruiter',
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
            candidate: 'Candidate',
        },

        admin: {
            administration: 'Administration',
            tools: 'Admin tools',
            description:
                'Manage users and platform administration.',
            manageUsers: 'Manage users',
        },

        account: {
            account: 'Account',
            yourAccount: 'Your account',
            email: 'Email',
            role: 'Role',
            status: 'Status',
        },
    },

    errors: {
        pageNotFound: 'Page not found',
    },

    feedback: {
        somethingWentWrong: 'Something went wrong',
        tryAgain: 'Try again',
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
        login: 'Login',

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
        title: 'Profile',
        backToDashboard: 'Back to dashboard',

        account: 'Account',
        accountInformation: 'Account information',
        email: 'Email',
        role: 'Role',
        status: 'Status',

        candidate: 'Candidate',
        candidateProfile: 'Candidate profile',
        createCandidateProfile: 'Create candidate profile',
        editProfile: 'Edit profile',

        loading: 'Loading candidate profile...',
        profileUnavailable: 'Profile unavailable',

        headline: 'Headline',
        summary: 'Summary',
        location: 'Location',
        minimumSalary: 'Minimum salary',
        maximumSalary: 'Maximum salary',
        salary: 'Salary',
        currency: 'Currency',
        availabilityDate: 'Availability date',
        availability: 'Availability',
        remotePreference: 'Remote preference',

        notSpecified: 'Not specified',
        upTo: 'Up to',
        from: 'From',

        saveProfile: 'Save profile',
        createProfile: 'Create profile',
        saving: 'Saving...',
        cancel: 'Cancel',

        profileUpdated: 'Profile updated successfully.',
        profileCreated: 'Profile created successfully.',

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
    },

    recruiterJobs: {
        title: 'Jobs',
        description: "Manage your company's job vacancies.",

        newJob: 'New Job',

        loading: 'Loading jobs...',
        loadError:
            'Unable to load your jobs. Please try again.',
        tryAgain: 'Try again',

        noJobs: 'No jobs yet',
        noJobsDescription:
            'Create your first job vacancy to start recruiting.',
        createFirstJob: 'Create your first job',

        yourJobs: 'Your jobs',

        locationNotSpecified: 'Location not specified',
        location: 'Location',

        salaryNotSpecified: 'Salary not specified',
        salary: 'Salary',
        upTo: 'Up to',

        employmentType: 'Employment type',
        workMode: 'Work mode',
        notSpecified: 'Not specified',

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
        closed: 'Closed',

        view: 'View',
        edit: 'Edit',

        jobNotFound: 'Job not found.',
        jobIdMissing: 'Job ID is missing.',
        unableToLoadDetails:
            'Unable to load this job.',
        backToJobs: 'Back to jobs',

        publish: 'Publish job',
        publishing: 'Publishing...',
        close: 'Close job',
        closing: 'Closing...',

        publishedSuccessfully:
            'Job published successfully.',
        closedSuccessfully:
            'Job closed successfully.',
        publishError:
            'Unable to publish this job. Please try again.',
        closeError:
            'Unable to close this job. Please try again.',

        jobDescription: 'Job description',
        jobInformation: 'Job information',
        expirationDate: 'Expiration date',

        requirements: 'Requirements',
        requirementsDescription:
            'Skills required or preferred for this position.',
        manageRequirements: 'Manage requirements',
        noRequirements:
            'No requirements configured.',
        requiredSkills: 'Required skills',
        preferredSkills: 'Preferred skills',
        minimumLevel: 'Minimum level',
        required: 'Required',
        preferred: 'Preferred',
        jobDetails: 'Job details',
        jobTitle: 'Job title',
        titleRequired: 'Title is required.',
        descriptionRequired: 'Description is required.',
        descriptionPlaceholder:
            'Describe the role, responsibilities and expectations...',
        jobTitlePlaceholder: 'e.g. Senior Frontend Developer',
        locationPlaceholder: 'e.g. Amsterdam, Netherlands',

        salaryExpiration: 'Salary & expiration',
        salaryMin: 'Minimum salary',
        salaryMax: 'Maximum salary',
        currency: 'Currency',

        jobRequirements: 'Job requirements',
        jobRequirementsDescription:
            'Add the skills candidates should have.',
        skill: 'Skill',
        selectSkill: 'Select a skill',
        type: 'Type',
        addRequirement: 'Add requirement',

        delete: 'Delete',
        unknownSkill: 'Unknown skill',

        loadingRequirements: 'Loading requirements...',
        noRequirementsAddedYet: 'No requirements added yet.',
        noRequirementsHaveBeenAdded:
            'No requirements have been added yet.',
        requirementsWillBeCreated:
            'These requirements will be created through the Requirements API when you save the job.',

        editJob: 'Edit job',
        createJob: 'Create job',
        updateJobDescription:
            'Update the details of your job vacancy.',
        createJobDescription:
            'Create a new job vacancy for your company.',

        saving: 'Saving...',
        saveChanges: 'Save changes',
        cancel: 'Cancel',

        loadSkillsError: 'Unable to load skills.',
        loadJobError: 'Unable to load the job.',
        loadRequirementsError:
            'Unable to load job requirements.',
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

        employmentType: 'Employment type',
        workMode: 'Work mode',

        location: 'Location',
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

        skill: 'Skill',
        selectSkill: 'Select a skill',

        type: 'Type',
        required: 'Required',
        preferred: 'Preferred',
        minimumLevel: 'Minimum level',

        addRequirement: 'Add requirement',
        loadingRequirements: 'Loading requirements...',
        noRequirementsYet: 'No requirements added yet.',
        noRequirementsAdded:
            'No requirements have been added yet.',
        requirementsWillBeCreated:
            'These requirements will be created through the Requirements API when you save the job.',

        cancel: 'Cancel',
        saving: 'Saving...',
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
        status: 'Status',
        allStatuses: 'All statuses',

        pending: 'Pending',
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
            status: 'Status',
            applied: 'Applied',
            lastUpdated: 'Last updated',

            candidate: 'Candidate',
            name: 'Name',
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