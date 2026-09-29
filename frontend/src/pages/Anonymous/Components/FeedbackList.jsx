// src/components/FeedbackList.jsx
import FeedbackItem from "./FeedbackItem";

export default function FeedbackList({ feedbacks }) {
    console.log(feedbacks)
    
    if (!feedbacks.length) {
        return (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">No feedback yet</h3>
                <p className="mt-2 text-sm text-gray-600">Be the first to submit feedback for this category</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map((fb) => (
                <FeedbackItem key={fb._id} feedback={fb} />
            ))}
        </div>
    );
}
