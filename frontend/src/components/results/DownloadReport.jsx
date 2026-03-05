import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import ReportDocument from './ReportDocument';
import './DownloadReport.css';

const DownloadReport = ({ recommendation, summary, rank = 1 }) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const blob = await pdf(
                <ReportDocument
                    recommendation={recommendation}
                    summary={summary}
                    rank={rank}
                />
            ).toBlob();

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${recommendation.card.name.replace(/\s+/g, '-')}-Report.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="btn-download"
            onClick={handleDownload}
            disabled={loading}
        >
            {loading ? (
                <>
                    <span className="download-spinner"></span>
                    Generating...
                </>
            ) : (
                <>
                    <span className="download-icon">📄</span>
                    Download Report
                </>
            )}
        </button>
    );
};

export default DownloadReport;
