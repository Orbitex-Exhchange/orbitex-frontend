import classnames from 'classnames';
import * as React from 'react';

export interface HistoryProps {
    /**
     * List of history data
     */
    data: React.ReactNode[][];
    /**
     * List of headers for history table
     */
    headers?: string[];
}

export const History: React.FC<HistoryProps> = ({ data, headers = ['Time', 'Action', 'Price', 'Amount', 'Total'] }) => {
    const renderAction = React.useCallback((actionType: string) => {
        const action = actionType ? actionType.toLowerCase() : actionType;
        const className = classnames('cr-history-action', {
            'cr-history-action--buy': action === 'bid',
            'cr-history-action--sell': action === 'ask',
        });

        return <span className={className}>{action}</span>;
    }, []);

    const mapRows = React.useCallback((cell: React.ReactNode, index: number) => {
        const actionIndex = headers.findIndex(header => header === 'Action');
        return index === actionIndex ? renderAction(cell as string) : cell;
    }, [headers, renderAction]);

    const tableData = data.map(row => row.map(mapRows));

    return (
        <div className="history-table">
            <div className="history-table__header">
                <h3>Trades History</h3>
            </div>
            <table className="history-table__content">
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
