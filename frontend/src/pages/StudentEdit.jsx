import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../services/api";


function StudentEdit() {

    // ==========================================
    // URL PARAMETER
    // ==========================================

    const {
        id
    } = useParams();


    const navigate =
        useNavigate();


    // ==========================================
    // STATES
    // ==========================================

    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    const [
        batches,
        setBatches
    ] = useState([]);


    // ==========================================
    // FORM
    // ==========================================

    const [
        form,
        setForm
    ] = useState({

        full_name: "",

        email: "",

        enrollment_number: "",

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


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {

        if (!id) {

            setError(
                "Student ID is missing."
            );

            setLoading(false);

            return;

        }


        loadData();

    }, [id]);


    // ==========================================
    // LOAD STUDENT + BATCHES
    // ==========================================

    async function loadData() {

        try {

            setLoading(true);

            setError("");


            const [
                studentResponse,
                batchesResponse
            ] = await Promise.all([

                api.get(
                    `/students/${id}`
                ),

                api.get(
                    "/batches"
                )

            ]);


            // ======================================
            // STUDENT RESPONSE
            // ======================================

            const student =

                studentResponse.data?.student ||

                studentResponse.data?.data ||

                studentResponse.data;


            if (
                !student ||
                !student.id
            ) {

                throw new Error(
                    "Student information was not returned by the server."
                );

            }


            // ======================================
            // BATCH RESPONSE
            // ======================================

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


            setBatches(
                batchesData
            );


            // ======================================
            // FIND BATCH
            // ======================================

            const batchId =

                student.batch_id ??

                student.batch?.id ??

                student.batch?.batch_id ??

                "";


            const selectedBatch =
                batchesData.find(

                    (batch) =>

                        String(batch.id) ===
                        String(batchId)

                );


            // ======================================
            // COURSE
            // ======================================

            const courseName =

                selectedBatch?.course_name ||

                student.course_name ||

                student.course ||

                "";


            // ======================================
            // ADMISSION YEAR
            // ======================================

            const admissionYear =

                selectedBatch?.batch_year ??

                student.admission_year ??

                "";


            // ======================================
            // CURRENT YEAR
            // ======================================

            const currentYear =

                student.current_year !== null &&

                student.current_year !== undefined

                    ? String(
                        student.current_year
                    )

                    : "";


            // ======================================
            // SEMESTER
            // ======================================

            const semester =

                student.semester !== null &&

                student.semester !== undefined

                    ? String(
                        student.semester
                    )

                    : "";


            // ======================================
            // SET FORM
            // ======================================

            setForm({

                full_name:
                    student.full_name || "",

                email:
                    student.email || "",

                enrollment_number:
                    student.enrollment_number || "",

                phone:
                    student.phone || "",

                gender:
                    student.gender || "",

                course_name:
                    courseName,

                branch:
                    student.branch || "",

                batch_id:
                    batchId !== ""
                        ? String(batchId)
                        : "",

                admission_year:
                    admissionYear !== null &&
                    admissionYear !== undefined
                        ? String(admissionYear)
                        : "",

                current_year:
                    currentYear,

                semester:
                    semester,

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


        } catch (error) {

            console.error(
                "Load student error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to load student."

            );

        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // GET SELECTED BATCH
    // ==========================================

    function getSelectedBatch() {

        return batches.find(

            (batch) =>

                String(batch.id) ===
                String(form.batch_id)

        );

    }


    // ==========================================
    // GET AVAILABLE YEARS
    // ==========================================

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


        // ======================================
        // FULL YEARS
        // ======================================

        for (

            let year = 1;

            year <= Math.floor(duration);

            year++

        ) {

            years.push(year);

        }


        // ======================================
        // DECIMAL YEAR
        //
        // Example:
        // 5.5 years
        //
        // 1,2,3,4,5,5.5
        // ======================================

        if (
            duration % 1 !== 0
        ) {

            years.push(duration);

        }


        return years;

    }


    // ==========================================
    // GET SEMESTERS FOR CURRENT YEAR
    // ==========================================

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


        // ======================================
        // DECIMAL YEAR
        //
        // Example:
        // Year 5.5
        // -> Semester 11
        // ======================================

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


        // ======================================
        // NORMAL YEAR
        // ======================================

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


    // ==========================================
    // HANDLE INPUT
    // ==========================================

    function handleChange(event) {

        const {
            name,
            value
        } = event.target;


        // ======================================
        // BATCH CHANGE
        // ======================================

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

            setSuccess("");

            return;

        }


        // ======================================
        // CURRENT YEAR CHANGE
        // ======================================

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

            setSuccess("");

            return;

        }


        // ======================================
        // NORMAL INPUT
        // ======================================

        setForm((previous) => ({

            ...previous,

            [name]:
                value

        }));


        setError("");

        setSuccess("");

    }


    // ==========================================
    // SUBMIT
    // ==========================================

    async function handleSubmit(event) {

        event.preventDefault();


        setError("");

        setSuccess("");


        // ======================================
        // BASIC VALIDATION
        // ======================================

        if (
            !form.full_name.trim()
        ) {

            setError(
                "Student name is required."
            );

            return;

        }


        if (
            !form.email.trim()
        ) {

            setError(
                "Email is required."
            );

            return;

        }


        if (
            !form.enrollment_number.trim()
        ) {

            setError(
                "Enrollment number is required."
            );

            return;

        }


        if (
            !form.batch_id
        ) {

            setError(
                "Please select a batch."
            );

            return;

        }


        // ======================================
        // SELECTED BATCH
        // ======================================

        const selectedBatch =
            getSelectedBatch();


        if (!selectedBatch) {

            setError(
                "Please select a valid batch."
            );

            return;

        }


        // ======================================
        // ADMISSION YEAR
        // ======================================

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


        // ======================================
        // COURSE DURATION
        // ======================================

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


        // ======================================
        // CURRENT YEAR
        // ======================================

        if (
            !form.current_year
        ) {

            setError(
                "Please select a current year."
            );

            return;

        }


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


        // ======================================
        // SEMESTER
        // ======================================

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

                semester >
                totalSemesters

            )

        ) {

            setError(

                `Semester must be between 1 and ${totalSemesters}.`

            );

            return;

        }


        // ======================================
        // CHECK SEMESTER MATCHES YEAR
        // ======================================

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


        // ======================================
        // GRADUATION YEAR
        // ======================================

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

                graduationYear <
                admissionYear

            )

        ) {

            setError(
                "Please enter a valid expected graduation year."
            );

            return;

        }


        // ======================================
        // UPDATE DATA
        // ======================================

        const updateData = {

            full_name:
                form.full_name.trim(),

            email:
                form.email
                    .trim()
                    .toLowerCase(),

            enrollment_number:
                form.enrollment_number.trim(),

            phone:
                form.phone.trim() ||
                null,

            gender:
                form.gender.trim() ||
                null,

            course_name:
                selectedBatch.course_name,

            branch:
                form.branch.trim() ||
                null,

            batch_id:
                Number(
                    form.batch_id
                ),

            admission_year:
                admissionYear,

            current_year:
                currentYear,

            semester:
                semester !== null
                    ? String(semester)
                    : null,

            expected_graduation_year:
                graduationYear,

            profile_image:
                form.profile_image
                    .trim() ||
                null,

            bio:
                form.bio
                    .trim() ||
                null

        };


        console.log(
            "Updating student:",
            updateData
        );


        // ======================================
        // UPDATE
        // ======================================

        try {

            setSaving(true);


            const response =
                await api.put(

                    `/students/${id}`,

                    updateData

                );


            console.log(
                "Update student response:",
                response.data
            );


            setSuccess(
                "Student updated successfully."
            );


            // ==================================
            // GO TO STUDENT PROFILE
            // ==================================

            setTimeout(() => {

                navigate(
                    `/students/${id}`
                );

            }, 800);


        } catch (error) {

            console.error(
                "Update student error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to update student."

            );

        } finally {

            setSaving(false);

        }

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <main className="page">

                <div className="empty">

                    Loading student...

                </div>

            </main>

        );

    }


    // ==========================================
    // ERROR WITHOUT STUDENT
    // ==========================================

    if (
        error &&
        !form.full_name
    ) {

        return (

            <main className="page">

                <div className="error">

                    {error}

                </div>


                <Link
                    to="/admin/students"
                    className="btn secondary"
                >

                    ← Back to Students

                </Link>

            </main>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <main className="page">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="dashboard-header">


                <div>

                    <Link
                        to="/admin/students"
                        className="public-back-link"
                    >

                        ← Back to Students

                    </Link>


                    <span className="eyebrow">

                        ADMIN / STUDENT

                    </span>


                    <h1>

                        Edit Student

                    </h1>


                    <p>

                        Update student information
                        and academic details.

                    </p>

                </div>


            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="error">

                    {error}

                </div>

            )}


            {/* ======================================
                SUCCESS
            ====================================== */}

            {success && (

                <div className="success">

                    {success}

                </div>

            )}


            {/* ======================================
                FORM
            ====================================== */}

            <section className="admin-form-card">


                <form
                    onSubmit={
                        handleSubmit
                    }
                >


                    {/* ==================================
                        PERSONAL INFORMATION
                    ================================== */}

                    <div className="form-section">


                        <span className="eyebrow">

                            PERSONAL INFORMATION

                        </span>


                        <h2>

                            Student Details

                        </h2>


                        {/* NAME */}

                        <div className="form-group">

                            <label htmlFor="full_name">

                                Full Name

                            </label>


                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                value={
                                    form.full_name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter full name"
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label htmlFor="email">

                                Email

                            </label>


                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={
                                    form.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter email"
                                required
                            />

                        </div>


                        {/* ENROLLMENT */}

                        <div className="form-group">

                            <label htmlFor="enrollment_number">

                                Enrollment Number

                            </label>


                            <input
                                id="enrollment_number"
                                name="enrollment_number"
                                type="text"
                                value={
                                    form.enrollment_number
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter enrollment number"
                                required
                            />

                        </div>


                        {/* PHONE */}

                        <div className="form-group">

                            <label htmlFor="phone">

                                Phone

                            </label>


                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                value={
                                    form.phone
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter phone number"
                            />

                        </div>


                        {/* GENDER */}

                        <div className="form-group">

                            <label htmlFor="gender">

                                Gender

                            </label>


                            <select
                                id="gender"
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

                        </div>


                        {/* BRANCH */}

                        <div className="form-group">

                            <label htmlFor="branch">

                                Branch

                            </label>


                            <input
                                id="branch"
                                name="branch"
                                type="text"
                                value={
                                    form.branch
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Example: CSE"
                            />

                        </div>


                    </div>


                    {/* ==================================
                        ACADEMIC INFORMATION
                    ================================== */}

                    <div className="form-section">


                        <span className="eyebrow">

                            ACADEMIC INFORMATION

                        </span>


                        <h2>

                            Course & Batch

                        </h2>


                        {/* BATCH */}

                        <div className="form-group">

                            <label htmlFor="batch_id">

                                Batch

                            </label>


                            <select
                                id="batch_id"
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

                        </div>


                        {/* COURSE */}

                        <div className="form-group">

                            <label htmlFor="course_name">

                                Course

                            </label>


                            <input
                                id="course_name"
                                name="course_name"
                                type="text"
                                value={
                                    form.course_name
                                }
                                readOnly
                                placeholder="Select batch first"
                            />

                        </div>


                        {/* ADMISSION YEAR */}

                        <div className="form-group">

                            <label htmlFor="admission_year">

                                Admission Year

                            </label>


                            <input
                                id="admission_year"
                                name="admission_year"
                                type="number"
                                value={
                                    form.admission_year
                                }
                                readOnly
                            />

                        </div>


                        {/* CURRENT YEAR */}

                        <div className="form-group">

                            <label htmlFor="current_year">

                                Current Year

                            </label>


                            <select
                                id="current_year"
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

                        </div>


                        {/* SEMESTER */}

                        <div className="form-group">

                            <label htmlFor="semester">

                                Semester

                            </label>


                            <select
                                id="semester"
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

                        </div>


                        {/* EXPECTED GRADUATION */}

                        <div className="form-group">

                            <label htmlFor="expected_graduation_year">

                                Expected Graduation Year

                            </label>


                            <input
                                id="expected_graduation_year"
                                name="expected_graduation_year"
                                type="number"
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

                        </div>


                    </div>


                    {/* ==================================
                        ADDITIONAL INFORMATION
                    ================================== */}

                    <div className="form-section">


                        <span className="eyebrow">

                            ADDITIONAL INFORMATION

                        </span>


                        <h2>

                            Profile

                        </h2>


                        {/* PROFILE IMAGE */}

                        <div className="form-group">

                            <label htmlFor="profile_image">

                                Profile Image URL

                            </label>


                            <input
                                id="profile_image"
                                name="profile_image"
                                type="text"
                                value={
                                    form.profile_image
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="https://..."
                            />

                        </div>


                        {/* BIO */}

                        <div className="form-group">

                            <label htmlFor="bio">

                                Bio

                            </label>


                            <textarea
                                id="bio"
                                name="bio"
                                value={
                                    form.bio
                                }
                                onChange={
                                    handleChange
                                }
                                rows="5"
                                placeholder="Student information..."
                            />

                        </div>


                    </div>


                    {/* ==================================
                        ACTIONS
                    ================================== */}

                    <div className="form-actions">


                        <Link
                            to="/admin/students"
                            className="btn secondary"
                        >

                            Cancel

                        </Link>


                        <button
                            type="submit"
                            className="btn primary"
                            disabled={
                                saving
                            }
                        >

                            {saving

                                ? "Saving..."

                                : "Save Changes"

                            }

                        </button>


                    </div>


                </form>


            </section>


        </main>

    );

}


export default StudentEdit;