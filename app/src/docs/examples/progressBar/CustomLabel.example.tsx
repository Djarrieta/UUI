import React, { useEffect, useMemo, useState } from 'react';
import { ProgressBar, Panel } from '@epam/promo';
import * as css from './BasicExample.scss';

export default function CustomLabelProgressBarExample() {
    const [progress, setProgress] = useState(0);

    const timer = () => setInterval(() => {
        setProgress((prevProgress) => {
            if (prevProgress === 100) {
                return 0;
            }
            const diff = Math.random() * 10;
            return parseInt(String(Math.min(prevProgress + diff, 100)), 10);
        });
    }, 500);

    useEffect(() => {
        timer();
        return () => {
            clearInterval(timer());
        };
    }, []);

    return (
        <Panel style={ { flexBasis: '100%' } } cx={ css.root } >
            <ProgressBar progress={ progress } label={ `${parseInt(`${progress / 10}`, 10)} / 10` } />
        </Panel>
    );
}