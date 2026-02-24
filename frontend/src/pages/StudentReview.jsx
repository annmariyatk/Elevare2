import React, { useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import Swal from 'sweetalert2';

function StudentReview() {
    const student_id = localStorage.getItem("student_id");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            Swal.fire('Rate us!', 'Please select a star rating.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/review/post/", {
                student_id: student_id,
                rating: rating,
                review: review
            });

            Swal.fire('Submitted!', 'Your review has been submitted for approval.', 'success');
            setRating(0);
            setReview("");
        } catch (err) {
            Swal.fire('Error', 'Failed to submit review.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            maxWidth: '600px', margin: '0 auto', background: 'white',
            padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            textAlign: 'center'
        }}>
            <h2 style={{ color: '#1F3E5A', marginBottom: '10px' }}>Rate Your Experience</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>
                Your feedback helps us improve Elevare.
            </p>

            <div style={{ marginBottom: '20px' }}>
                {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                        <label key={index} style={{ cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                onClick={() => setRating(ratingValue)}
                                style={{ display: 'none' }}
                            />
                            <Star
                                size={40}
                                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e2e8f0"}
                                fill={ratingValue <= (hover || rating) ? "#ffc107" : "none"}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(0)}
                                style={{ transition: 'all 0.2s', margin: '0 5px' }}
                            />
                        </label>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Tell us what you liked or how we can improve..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows="5"
                    style={{
                        width: '100%', padding: '15px', borderRadius: '8px',
                        border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical',
                        marginBottom: '20px', fontFamily: 'inherit'
                    }}
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        background: '#336B91', color: 'white', padding: '12px 40px',
                        borderRadius: '30px', border: 'none', fontSize: '1rem',
                        fontWeight: '600', cursor: 'pointer', transition: 'transform 0.1s'
                    }}
                >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
            </form>
        </div>
    );
}

export default StudentReview;
