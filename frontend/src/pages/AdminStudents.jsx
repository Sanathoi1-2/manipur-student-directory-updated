import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import api from "../services/api";


function AdminStudents() {

    // =====================================================
    // STATES
    // =====================================================

    const [
        students,
        setStudents
    ] = useState([]);


    const [
        batches,
        setBatches
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        search,
        setSearch
    ] = useState("");


    const [
        deletingId,
        setDeletingId
    ] = useState(null);


    const [
        showForm,
        setShowForm
    ] = useState(false);


    const [
        editingStudent,
        setEditingStudent
    ] = useState(null);


    // =====================================================
    // IMAGE STATE
    // =====================================================

    const [
        imageFile,
        setImageFile
    ] = useState(null);


    const [
        imagePreview,
        setImagePreview
    ] = useState("");


    const [
        uploadingImage,
        setUploadingImage
    ] = useState(false);


    // =====================================================
    // FORM
    // =====================================================

    const [
        form,
        setForm
    ] = useState({

        full_name: "",

        enrollment_number: "",

        email: "",

        phone: "",

        gender: "",

        course_name: "",

        branch: "",

        batch_id: "",

        admission_year: "",

        current_year: "",

        semester: "",

        expected_graduation_year: "",

        profile_image: "",

        bio: ""

    });


    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {

        loadData();

    }, []);


    async function loadData() {

        try {

            setLoading(true);

            setError("");


            const [
                studentsResponse,
                batchesResponse
            ] = await Promise.all([

                api.get("/students"),

                api.get("/batches")

            ]);


            // =================================================
            // STUDENTS RESPONSE
            // =================================================

            const studentsData =

                Array.isArray(
                    studentsResponse.data
                )

                    ? studentsResponse.data

                    : Array.isArray(
                        studentsResponse.data?.students
                    )

                        ? studentsResponse.data.students

                        : Array.isArray(
                            studentsResponse.data?.data
                        )

                            ? studentsResponse.data.data

                            : [];


            // =================================================
            // BATCHES RESPONSE
            // =================================================

            const batchesData =

                Array.isArray(
                    batchesResponse.data
                )

                    ? batchesResponse.data

                    : Array.isArray(
                        batchesResponse.data?.batches
                    )

                        ? batchesResponse.data.batches

                        : Array.isArray(
                            batchesResponse.data?.data
                        )

                            ? batchesResponse.data.data

                            : [];


            setStudents(
                studentsData
            );


            setBatches(
                batchesData
            );


        } catch (error) {

            console.error(
                "Load students data error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to load students."

            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // FORM CHANGE
    // =====================================================

    function handleChange(e) {

        const {
            name,
            value
        } = e.target;


        // =================================================
        // BATCH SELECTED
        // =================================================

        if (
            name === "batch_id"
        ) {

            const selectedBatch =
                batches.find(

                    (batch) =>

                        String(batch.id) ===
                        String(value)

                );


            if (selectedBatch) {

                setForm((previous) => ({

                    ...previous,

                    batch_id:
                        value,

                    course_name:
                        selectedBatch.course_name || "",

                    admission_year:
                        selectedBatch.batch_year || "",

                    current_year:
                        "",

                    semester:
                        "",

                    expected_graduation_year:
                        ""

                }));

            } else {

                setForm((previous) => ({

                    ...previous,

                    batch_id:
                        value,

                    course_name:
                        "",

                    admission_year:
                        "",

                    current_year:
                        "",

                    semester:
                        "",

                    expected_graduation_year:
                        ""

                }));

            }


            setError("");

            return;

        }


        // =================================================
        // CURRENT YEAR CHANGED
        // =================================================

        if (
            name === "current_year"
        ) {

            setForm((previous) => ({

                ...previous,

                current_year:
                    value,

                semester:
                    ""

            }));


            setError("");

            return;

        }


        // =================================================
        // NORMAL CHANGE
        // =================================================

        setForm((previous) => ({

            ...previous,

            [name]:
                value

        }));


        setError("");

    }


    // =====================================================
    // IMAGE CHANGE
    // =====================================================

    function handleImageChange(e) {

        const file =
            e.target.files?.[0];


        if (!file) {

            return;

        }


        // =================================================
        // ALLOWED TYPES
        // =================================================

        const allowedTypes = [

            "image/jpeg",

            "image/jpg",

            "image/png",

            "image/webp"

        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            setError(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            );


            e.target.value = "";

            return;

        }


        // =================================================
        // MAXIMUM 5 MB
        // =================================================

        const maxSize =
            5 * 1024 * 1024;


        if (
            file.size > maxSize
        ) {

            setError(
                "Profile image must be smaller than 5 MB."
            );


            e.target.value = "";

            return;

        }


        // =================================================
        // OLD PREVIEW CLEANUP
        // =================================================

        if (
            imagePreview &&
            imagePreview.startsWith("blob:")
        ) {

            URL.revokeObjectURL(
                imagePreview
            );

        }


        // =================================================
        // SAVE FILE
        // =================================================

        setImageFile(
            file
        );


        // =================================================
        // CREATE PREVIEW
        // =================================================

        const previewUrl =
            URL.createObjectURL(
                file
            );


        setImagePreview(
            previewUrl
        );


        setError("");

    }


    // =====================================================
    // IMAGE URL
    // =====================================================

    function getImageUrl(
        imagePath
    ) {

        if (!imagePath) {

            return "";

        }


        // Already complete URL

        if (

            imagePath.startsWith(
                "http://"
            ) ||

            imagePath.startsWith(
                "https://"
            ) ||

            imagePath.startsWith(
                "blob:"
            )

        ) {

            return imagePath;

        }


        // =================================================
        // API BASE URL
        // =================================================

        const baseURL =
            api.defaults?.baseURL ||
            "http://localhost:5000/api";


        const serverURL =
            baseURL.replace(
                /\/api\/?$/,
                ""
            );


        // =================================================
        // IMAGE PATH
        // =================================================

        if (
            imagePath.startsWith("/")
        ) {

            return `${serverURL}${imagePath}`;

        }


        return `${serverURL}/${imagePath}`;

    }


    // =====================================================
    // SELECTED BATCH
    // =====================================================

    function getSelectedBatch() {

        return batches.find(

            (batch) =>

                String(batch.id) ===
                String(form.batch_id)

        );

    }


    // =====================================================
    // AVAILABLE YEARS
    // =====================================================

    function getAvailableYears() {

        const selectedBatch =
            getSelectedBatch();


        if (!selectedBatch) {

            return [];

        }


        const duration =
            Number(
                selectedBatch.duration_years
            );


        if (

            !Number.isFinite(duration) ||

            duration <= 0

        ) {

            return [];

        }


        const years = [];


        for (

            let year = 1;

            year <= Math.floor(duration);

            year++

        ) {

            years.push(year);

        }


        // Example:
        // 5.5 -> 1,2,3,4,5,5.5

        if (
            duration % 1 !== 0
        ) {

            years.push(duration);

        }


        return years;

    }


    // =====================================================
    // AVAILABLE SEMESTERS
    // =====================================================

    function getAvailableSemesters() {

        const selectedBatch =
            getSelectedBatch();


        if (!selectedBatch) {

            return [];

        }


        const duration =
            Number(
                selectedBatch.duration_years
            );


        if (

            !Number.isFinite(duration) ||

            duration <= 0

        ) {

            return [];

        }


        const totalSemesters =
            Math.ceil(
                duration * 2
            );


        return Array.from(

            {
                length:
                    totalSemesters
            },

            (_, index) =>
                index + 1

        );

    }


    // =====================================================
    // SEMESTERS FOR CURRENT YEAR
    // =====================================================

    function getSemestersForCurrentYear() {

        const currentYear =
            Number(
                form.current_year
            );


        const selectedBatch =
            getSelectedBatch();


        if (
            !selectedBatch ||
            !currentYear
        ) {

            return [];

        }


        const duration =
            Number(
                selectedBatch.duration_years
            );


        if (
            !Number.isFinite(duration)
        ) {

            return [];

        }


        const totalSemesters =
            Math.ceil(
                duration * 2
            );


        // =================================================
        // DECIMAL YEAR
        // =================================================

        if (
            currentYear % 1 !== 0
        ) {

            const semester =
                Math.round(
                    currentYear * 2
                );


            return [

                semester

            ].filter(

                (value) =>

                    value <=
                    totalSemesters

            );

        }


        // =================================================
        // NORMAL YEAR
        // =================================================

        const firstSemester =
            (currentYear - 1) * 2 + 1;


        const secondSemester =
            firstSemester + 1;


        return [

            firstSemester,

            secondSemester

        ].filter(

            (semester) =>

                semester <=
                totalSemesters

        );

    }


    // =====================================================
    // RESET FORM
    // =====================================================

    function resetForm() {

        if (

            imagePreview &&

            imagePreview.startsWith(
                "blob:"
            )

        ) {

            URL.revokeObjectURL(
                imagePreview
            );

        }


        setForm({

            full_name: "",

            enrollment_number: "",

            email: "",

            phone: "",

            gender: "",

            course_name: "",

            branch: "",

            batch_id: "",

            admission_year: "",

            current_year: "",

            semester: "",

            expected_graduation_year: "",

            profile_image: "",

            bio: ""

        });


        setImageFile(
            null
        );


        setImagePreview(
            ""
        );


        setEditingStudent(
            null
        );


        setShowForm(
            false
        );


        setError("");

    }


    // =====================================================
    // OPEN ADD FORM
    // =====================================================

    function openAddForm() {

        if (

            imagePreview &&

            imagePreview.startsWith(
                "blob:"
            )

        ) {

            URL.revokeObjectURL(
                imagePreview
            );

        }


        setEditingStudent(
            null
        );


        setForm({

            full_name: "",

            enrollment_number: "",

            email: "",

            phone: "",

            gender: "",

            course_name: "",

            branch: "",

            batch_id: "",

            admission_year: "",

            current_year: "",

            semester: "",

            expected_graduation_year: "",

            profile_image: "",

            bio: ""

        });


        setImageFile(
            null
        );


        setImagePreview(
            ""
        );


        setError("");

        setShowForm(
            true
        );

    }


    // =====================================================
    // OPEN EDIT FORM
    // =====================================================

    function openEditForm(student) {

        setEditingStudent(
            student
        );


        const selectedBatch =
            batches.find(

                (batch) =>

                    String(batch.id) ===
                    String(student.batch_id)

            );


        setForm({

            full_name:
                student.full_name || "",

            enrollment_number:
                student.enrollment_number || "",

            email:
                student.email || "",

            phone:
                student.phone || "",

            gender:
                student.gender || "",

            course_name:
                selectedBatch?.course_name ||

                student.course_name ||

                "",

            branch:
                student.branch || "",

            batch_id:
                student.batch_id
                    ? String(
                        student.batch_id
                    )
                    : "",

            admission_year:
                selectedBatch?.batch_year ||

                student.admission_year ||

                "",

            current_year:
                student.current_year !== null &&
                student.current_year !== undefined

                    ? String(
                        student.current_year
                    )

                    : "",

            semester:
                student.semester !== null &&
                student.semester !== undefined

                    ? String(
                        student.semester
                    )

                    : "",

            expected_graduation_year:
                student.expected_graduation_year !== null &&
                student.expected_graduation_year !== undefined

                    ? String(
                        student.expected_graduation_year
                    )

                    : "",

            profile_image:
                student.profile_image || "",

            bio:
                student.bio || ""

        });


        setImageFile(
            null
        );


        setImagePreview(
            getImageUrl(
                student.profile_image
            )
        );


        setError("");

        setShowForm(
            true
        );

    }


    // =====================================================
    // SUBMIT
    // =====================================================

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");


        // =================================================
        // REQUIRED FIELDS
        // =================================================

        if (

            !form.full_name.trim() ||

            !form.enrollment_number.trim() ||

            !form.email.trim() ||

            !form.batch_id ||

            !form.admission_year ||

            !form.current_year

        ) {

            setError(
                "Please fill all required fields."
            );

            return;

        }


        // =================================================
        // SELECTED BATCH
        // =================================================

        const selectedBatch =
            batches.find(

                (batch) =>

                    String(batch.id) ===
                    String(form.batch_id)

            );


        if (!selectedBatch) {

            setError(
                "Please select a valid batch."
            );

            return;

        }


        // =================================================
        // ADMISSION YEAR
        // =================================================

        const admissionYear =
            Number(
                selectedBatch.batch_year
            );


        if (

            !Number.isInteger(
                admissionYear
            ) ||

            admissionYear < 2000 ||

            admissionYear > 2100

        ) {

            setError(
                "Invalid batch admission year."
            );

            return;

        }


        // =================================================
        // COURSE DURATION
        // =================================================

        const courseDuration =
            Number(
                selectedBatch.duration_years
            );


        if (

            !Number.isFinite(
                courseDuration
            ) ||

            courseDuration <= 0

        ) {

            setError(
                "Invalid course duration."
            );

            return;

        }


        // =================================================
        // CURRENT YEAR
        // =================================================

        const currentYear =
            Number(
                form.current_year
            );


        if (

            !Number.isFinite(
                currentYear
            ) ||

            currentYear <= 0

        ) {

            setError(
                "Please select a valid current year."
            );

            return;

        }


        if (
            currentYear > courseDuration
        ) {

            setError(

                `Current year cannot be greater than the course duration of ${courseDuration} years.`

            );

            return;

        }


        // =================================================
        // SEMESTER
        // =================================================

        const semester =
            form.semester
                ? Number(
                    form.semester
                )
                : null;


        const totalSemesters =
            Math.ceil(
                courseDuration * 2
            );


        if (

            semester !== null &&

            (

                !Number.isInteger(
                    semester
                ) ||

                semester < 1 ||

                semester > totalSemesters

            )

        ) {

            setError(

                `Semester must be between 1 and ${totalSemesters}.`

            );

            return;

        }


        // =================================================
        // SEMESTER/YEAR MATCH
        // =================================================

        if (
            semester !== null
        ) {

            const availableSemesters =
                getSemestersForCurrentYear();


            if (
                !availableSemesters.includes(
                    semester
                )
            ) {

                setError(

                    `Semester ${semester} does not belong to Year ${currentYear}.`

                );

                return;

            }

        }


        // =================================================
        // GRADUATION YEAR
        // =================================================

        const graduationYear =
            form.expected_graduation_year
                ? Number(
                    form.expected_graduation_year
                )
                : null;


        if (

            graduationYear !== null &&

            (

                !Number.isInteger(
                    graduationYear
                ) ||

                graduationYear < admissionYear

            )

        ) {

            setError(
                "Please enter a valid expected graduation year."
            );

            return;

        }


        // =================================================
        // FORM DATA
        // =================================================

        const studentData =
            new FormData();


        studentData.append(
            "full_name",
            form.full_name.trim()
        );


        studentData.append(
            "enrollment_number",
            form.enrollment_number.trim()
        );


        studentData.append(
            "email",
            form.email
                .trim()
                .toLowerCase()
        );


        studentData.append(
            "phone",
            form.phone.trim() || ""
        );


        studentData.append(
            "gender",
            form.gender.trim() || ""
        );


        studentData.append(
            "course_name",
            selectedBatch.course_name || ""
        );


        studentData.append(
            "branch",
            form.branch.trim() || ""
        );


        studentData.append(
            "batch_id",
            String(form.batch_id)
        );


        studentData.append(
            "admission_year",
            String(admissionYear)
        );


        studentData.append(
            "current_year",
            String(currentYear)
        );


        studentData.append(
            "semester",
            semester !== null
                ? String(semester)
                : ""
        );


        studentData.append(
            "expected_graduation_year",
            graduationYear !== null
                ? String(graduationYear)
                : ""
        );


        studentData.append(
            "bio",
            form.bio.trim() || ""
        );


        // =================================================
        // IMAGE
        // =================================================

        if (imageFile) {

            studentData.append(
                "profile_image",
                imageFile
            );

        }


        // =================================================
        // SAVE
        // =================================================

        try {

            setUploadingImage(
                Boolean(imageFile)
            );


            if (editingStudent) {

                await api.put(

                    `/students/${editingStudent.id}`,

                    studentData,

                    {

                        headers: {

                            "Content-Type":
                                "multipart/form-data"

                        }

                    }

                );

            } else {

                await api.post(

                    "/students",

                    studentData,

                    {

                        headers: {

                            "Content-Type":
                                "multipart/form-data"

                        }

                    }

                );

            }


            // =================================================
            // RELOAD
            // =================================================

            await loadData();


            // =================================================
            // CLOSE
            // =================================================

            resetForm();


        } catch (error) {

            console.error(
                "Save student error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            console.error(
                "Status:",
                error.response?.status
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to save student."

            );

        } finally {

            setUploadingImage(
                false
            );

        }

    }


    // =====================================================
    // DELETE
    // =====================================================

    async function handleDelete(student) {

        const confirmed =
            window.confirm(

                `Are you sure you want to delete ${student.full_name}?`

            );


        if (!confirmed) {

            return;

        }


        try {

            setDeletingId(
                student.id
            );

            setError("");


            await api.delete(
                `/students/${student.id}`
            );


            setStudents(
                (previous) =>

                    previous.filter(

                        (item) =>

                            item.id !==
                            student.id

                    )
            );


        } catch (error) {

            console.error(
                "Delete student error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to delete student."

            );

        } finally {

            setDeletingId(
                null
            );

        }

    }


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredStudents =

        students.filter(
            (student) => {

                const query =
                    search
                        .toLowerCase()
                        .trim();


                if (!query) {

                    return true;

                }


                return (

                    student.full_name
                        ?.toLowerCase()
                        .includes(query)

                    ||

                    student.enrollment_number
                        ?.toLowerCase()
                        .includes(query)

                    ||

                    student.email
                        ?.toLowerCase()
                        .includes(query)

                    ||

                    student.course_name
                        ?.toLowerCase()
                        .includes(query)

                    ||

                    student.batch_name
                        ?.toLowerCase()
                        .includes(query)

                    ||

                    student.branch
                        ?.toLowerCase()
                        .includes(query)

                );

            }
        );


    // =====================================================
    // GET BATCH NAME
    // =====================================================

    function getBatchName(batchId) {

        const batch =
            batches.find(

                (item) =>

                    Number(item.id) ===
                    Number(batchId)

            );


        return batch
            ? batch.batch_name
            : "No Batch";

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <main className="page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <div>

                    <span className="eyebrow">

                        ADMIN

                    </span>


                    <h1>

                        Students

                    </h1>


                    <p>

                        Manage Manipur students
                        and their academic batches.

                    </p>

                </div>


                <button
                    type="button"
                    className="btn primary"
                    onClick={
                        openAddForm
                    }
                >

                    + Add Student

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error">

                    {error}

                </div>

            )}


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="admin-toolbar">

                <input
                    type="text"
                    placeholder="Search student..."
                    value={
                        search
                    }
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />


                <span>

                    {
                        filteredStudents.length
                    }

                    {" "}

                    students

                </span>

            </div>


            {/* =================================================
                ADD / EDIT FORM
            ================================================= */}

            {showForm && (

                <section className="admin-form-card">


                    {/* FORM HEADER */}

                    <div className="form-header">

                        <div>

                            <span className="eyebrow">

                                {editingStudent

                                    ? "EDIT STUDENT"

                                    : "NEW STUDENT"

                                }

                            </span>


                            <h2>

                                {editingStudent

                                    ? "Edit Student"

                                    : "Add Student"

                                }

                            </h2>

                        </div>


                        <button
                            type="button"
                            className="close-btn"
                            onClick={
                                resetForm
                            }
                        >

                            ×

                        </button>

                    </div>


                    {/* FORM */}

                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="form-grid">


                            {/* FULL NAME */}

                            <label>

                                Full Name *

                                <input
                                    type="text"
                                    name="full_name"
                                    value={
                                        form.full_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    placeholder="Student full name"
                                />

                            </label>


                            {/* ENROLLMENT */}

                            <label>

                                Enrollment Number *

                                <input
                                    type="text"
                                    name="enrollment_number"
                                    value={
                                        form.enrollment_number
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    placeholder="Enrollment number"
                                />

                            </label>


                            {/* EMAIL */}

                            <label>

                                Email *

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        form.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    placeholder="student@email.com"
                                />

                            </label>


                            {/* PHONE */}

                            <label>

                                Phone

                                <input
                                    type="text"
                                    name="phone"
                                    value={
                                        form.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Phone number"
                                />

                            </label>


                            {/* GENDER */}

                            <label>

                                Gender

                                <select
                                    name="gender"
                                    value={
                                        form.gender
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">

                                        Select Gender

                                    </option>


                                    <option value="Male">

                                        Male

                                    </option>


                                    <option value="Female">

                                        Female

                                    </option>


                                    <option value="Other">

                                        Other

                                    </option>

                                </select>

                            </label>


                            {/* BATCH */}

                            <label>

                                Batch *

                                <select
                                    name="batch_id"
                                    value={
                                        form.batch_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">

                                        Select Batch

                                    </option>


                                    {batches.map(
                                        (batch) => (

                                            <option
                                                key={
                                                    batch.id
                                                }
                                                value={
                                                    batch.id
                                                }
                                            >

                                                {
                                                    batch.batch_name
                                                }

                                                {" — "}

                                                {
                                                    batch.duration_years
                                                }

                                                {" years"}

                                            </option>

                                        )
                                    )}

                                </select>

                            </label>


                            {/* COURSE */}

                            <label>

                                Course

                                <input
                                    type="text"
                                    name="course_name"
                                    value={
                                        form.course_name
                                    }
                                    readOnly
                                    placeholder="Select a batch"
                                />

                            </label>


                            {/* BRANCH */}

                            <label>

                                Branch

                                <input
                                    type="text"
                                    name="branch"
                                    value={
                                        form.branch
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: CSE"
                                />

                            </label>


                            {/* ADMISSION YEAR */}

                            <label>

                                Admission Year *

                                <input
                                    type="number"
                                    name="admission_year"
                                    value={
                                        form.admission_year
                                    }
                                    readOnly
                                    required
                                    placeholder="Select a batch"
                                />

                            </label>


                            {/* CURRENT YEAR */}

                            <label>

                                Current Year *

                                <select
                                    name="current_year"
                                    value={
                                        form.current_year
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={
                                        !form.batch_id
                                    }
                                >

                                    <option value="">

                                        {form.batch_id

                                            ? "Select Year"

                                            : "Select Batch First"

                                        }

                                    </option>


                                    {getAvailableYears().map(
                                        (year) => (

                                            <option
                                                key={
                                                    year
                                                }
                                                value={
                                                    year
                                                }
                                            >

                                                Year{" "}

                                                {
                                                    year
                                                }

                                            </option>

                                        )
                                    )}

                                </select>


                                {form.batch_id && (

                                    <small>

                                        Course Duration:{" "}

                                        {
                                            getSelectedBatch()
                                                ?.duration_years
                                        }

                                        {" years"}

                                    </small>

                                )}

                            </label>


                            {/* SEMESTER */}

                            <label>

                                Semester

                                <select
                                    name="semester"
                                    value={
                                        form.semester
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        !form.current_year
                                    }
                                >

                                    <option value="">

                                        {form.current_year

                                            ? "Select Semester"

                                            : "Select Year First"

                                        }

                                    </option>


                                    {getSemestersForCurrentYear().map(
                                        (semester) => (

                                            <option
                                                key={
                                                    semester
                                                }
                                                value={
                                                    semester
                                                }
                                            >

                                                Semester{" "}

                                                {
                                                    semester
                                                }

                                            </option>

                                        )
                                    )}

                                </select>


                                {form.current_year && (

                                    <small>

                                        Available for Year{" "}

                                        {
                                            form.current_year
                                        }

                                        :{" "}

                                        {
                                            getSemestersForCurrentYear()
                                                .join(", ")
                                        }

                                    </small>

                                )}

                            </label>


                            {/* GRADUATION YEAR */}

                            <label>

                                Expected Graduation Year

                                <input
                                    type="number"
                                    name="expected_graduation_year"
                                    value={
                                        form.expected_graduation_year
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="2000"
                                    max="2200"
                                    placeholder="2030"
                                />

                            </label>


                            {/* PROFILE IMAGE */}

                            <label>

                                Profile Image

                                <input
                                    type="file"
                                    name="profile_image"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={
                                        handleImageChange
                                    }
                                />


                                <small>

                                    JPG, PNG or WEBP.
                                    Maximum 5 MB.

                                </small>


                                {imagePreview && (

                                    <div
                                        className="image-preview"
                                        style={{
                                            marginTop: "10px"
                                        }}
                                    >

                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Student preview"
                                            style={{
                                                width: "120px",
                                                height: "120px",
                                                objectFit: "cover",
                                                borderRadius: "12px",
                                                border: "1px solid #ddd"
                                            }}
                                        />

                                    </div>

                                )}

                            </label>


                            {/* BIO */}

                            <label className="full-width">

                                Bio

                                <textarea
                                    name="bio"
                                    value={
                                        form.bio
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="Student information..."
                                />

                            </label>


                        </div>


                        {/* FORM ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="btn secondary"
                                onClick={
                                    resetForm
                                }
                                disabled={
                                    uploadingImage
                                }
                            >

                                Cancel

                            </button>


                            <button
                                type="submit"
                                className="btn primary"
                                disabled={
                                    uploadingImage
                                }
                            >

                                {uploadingImage

                                    ? "Uploading..."

                                    : editingStudent

                                        ? "Update Student"

                                        : "Add Student"

                                }

                            </button>

                        </div>

                    </form>

                </section>

            )}


            {/* =================================================
                STUDENT TABLE
            ================================================= */}

            <section className="table-card">


                {loading ? (

                    <div className="empty">

                        Loading students...

                    </div>

                ) : filteredStudents.length === 0 ? (

                    <div className="empty">

                        <h3>

                            No students found

                        </h3>


                        <p>

                            Add your first student.

                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Enrollment
                                    </th>

                                    <th>
                                        Course
                                    </th>

                                    <th>
                                        Batch
                                    </th>

                                    <th>
                                        Year
                                    </th>

                                    <th>
                                        Semester
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredStudents.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student.id
                                            }
                                        >


                                            {/* STUDENT */}

                                            <td>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "10px"
                                                    }}
                                                >

                                                    {student.profile_image ? (

                                                        <img
                                                            src={
                                                                getImageUrl(
                                                                    student.profile_image
                                                                )
                                                            }
                                                            alt={
                                                                student.full_name
                                                            }
                                                            style={{
                                                                width: "45px",
                                                                height: "45px",
                                                                objectFit: "cover",
                                                                borderRadius: "50%"
                                                            }}
                                                        />

                                                    ) : (

                                                        <div
                                                            style={{
                                                                width: "45px",
                                                                height: "45px",
                                                                borderRadius: "50%",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                background: "#eee",
                                                                fontWeight: "600"
                                                            }}
                                                        >

                                                            {
                                                                student.full_name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase()
                                                            }

                                                        </div>

                                                    )}


                                                    <strong>

                                                        {
                                                            student.full_name
                                                        }

                                                    </strong>

                                                </div>

                                            </td>


                                            {/* ENROLLMENT */}

                                            <td>

                                                {
                                                    student.enrollment_number
                                                }

                                            </td>


                                            {/* COURSE */}

                                            <td>

                                                {
                                                    student.course_name
                                                }

                                            </td>


                                            {/* BATCH */}

                                            <td>

                                                {
                                                    student.batch_name ||

                                                    getBatchName(
                                                        student.batch_id
                                                    )

                                                }

                                            </td>


                                            {/* YEAR */}

                                            <td>

                                                Year{" "}

                                                {
                                                    student.current_year
                                                }

                                            </td>


                                            {/* SEMESTER */}

                                            <td>

                                                {
                                                    student.semester

                                                        ? `Semester ${student.semester}`

                                                        : "—"

                                                }

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="action-buttons">


                                                    {/* VIEW */}

                                                    <Link
                                                        to={`/students/${student.id}`}
                                                        className="view-btn"
                                                    >

                                                        View

                                                    </Link>


                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            openEditForm(
                                                                student
                                                            )
                                                        }
                                                    >

                                                        Edit

                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        className="delete-btn"
                                                        disabled={
                                                            deletingId ===
                                                            student.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                student
                                                            )
                                                        }
                                                    >

                                                        {deletingId ===
                                                        student.id

                                                            ? "Deleting..."

                                                            : "Delete"

                                                        }

                                                    </button>

                                                </div>

                                            </td>


                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </main>

    );

}


export default AdminStudents;