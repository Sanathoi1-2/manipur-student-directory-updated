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

            <div className="student-avatar">

                {student.profile_image ? (

                    <img
                        src={
                            student.profile_image
                        }
                        alt={
                            student.full_name
                        }
                    />

                ) : (

                    <span>
                        {
                            student.full_name
                                ?.charAt(0)
                                ?.toUpperCase()
                        }
                    </span>

                )}

            </div>


            <div className="student-info">

                <h3>
                    {student.full_name}
                </h3>

                <p>
                    {student.course_name}
                </p>

                <p>
                    {
                        student.enrollment_number
                    }
                </p>

            </div>


            <div className="student-meta">

                <span className="year-badge">

                    Year{" "}
                    {student.current_year}

                </span>


                <span>

                    {student.batch_name}

                </span>

            </div>

        </Link>

    );

}


export default StudentCard;