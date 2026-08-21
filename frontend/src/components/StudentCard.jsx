import {
    Link
} from "react-router-dom";


function StudentCard({
    student
}) {

    return (

        <Link
            to={`/students/${student.id}`}
            className="student-card"
        >

            {/* ==============================
                PROFILE IMAGE
            ============================== */}

            <div className="student-card-image">

                <div className="student-avatar">

                    {student.profile_image ? (

                        <img
                            src={student.profile_image}
                            alt={student.full_name}
                        />

                    ) : (

                        <span>
                            {student.full_name
                                ?.charAt(0)
                                ?.toUpperCase()}
                        </span>

                    )}

                </div>

            </div>


            {/* ==============================
                STUDENT INFORMATION
            ============================== */}

            <div className="student-info">

                <div className="student-name-row">

                    <h3>
                        {student.full_name}
                    </h3>

                    <span className="student-arrow">
                        →
                    </span>

                </div>


                <p className="student-course">
                    {student.course_name}
                </p>


                <div className="student-enrollment">

                    <span className="enrollment-label">
                        Enrollment
                    </span>

                    <span className="enrollment-number">
                        {student.enrollment_number}
                    </span>

                </div>

            </div>


            {/* ==============================
                STUDENT META
            ============================== */}

            <div className="student-meta">

                <span className="year-badge">

                    Year {student.current_year}

                </span>


                <span className="student-batch">

                    {student.batch_name}

                </span>

            </div>

        </Link>

    );

}


export default StudentCard;