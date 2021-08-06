import React, { useEffect, useMemo } from 'react';
import { FlexSpacer, Button, FlexCell, FlexRow, LinkButton, ModalBlocker, ModalFooter, ModalHeader, ModalWindow, Panel, ScrollBars, Text } from '@epam/promo';
import * as css from './ScrollSpyReader.scss';
import { useScrollSpy } from './ScrollSpy';
import { svc } from '../../services';

export function ScrollSpyModal() {
    const links = useMemo(() => [
        { id: 'a', caption: 'First' },
        { id: 'b', caption: 'Second' },
    ], []);

    const { scrollToElement, currentActive, setRef } = useScrollSpy({ elements: ['a', 'b'] });

    const getContinuationModal = () => {
        svc.uuiModals.show(modalProps => (
            <ModalBlocker blockerShadow='dark' { ...modalProps }>
                <ModalWindow>
                    <Panel background="white">
                        <ModalHeader title="Continue reading? " onClose={ () => modalProps.abort() } />
                        <ScrollBars hasTopShadow hasBottomShadow >
                            <FlexRow padding='24'>
                                <Text size='36'>Would you like to continue reading from the place you previously stopped?</Text>
                            </FlexRow>
                        </ScrollBars>
                        <ModalFooter>
                            <FlexSpacer />
                            <Button color='gray50' fill='white' caption='Cancel' onClick={ () => modalProps.abort() } />
                            <Button
                                color='green'
                                caption='Ok'
                                onClick={ () => {
                                    modalProps.abort();
                                    scrollToElement('b');
                                } }
                            />
                        </ModalFooter>
                    </Panel>
                </ModalWindow>
            </ModalBlocker>
        )).catch(() => null);
    }

    useEffect(getContinuationModal, []);

    return (
        <FlexRow>
            <FlexCell grow={ 2 } alignSelf='start' cx={ css.menu } textAlign='center'>
                {links.map(link => (
                    <LinkButton
                        isLinkActive={currentActive === link.id}
                        key={link.id}
                        onClick={() => scrollToElement(link.id)}
                        caption={link.caption}
                        href={`#${link.id}`}
                    />
                ))}
            </FlexCell>
            <FlexCell grow={ 5 }>
                <section ref={setRef}>
                    <Text font='museo-slab' size='48' cx={ css.content } lineHeight='30'>
                        <section data-spy='a'>
                            <Text data- cx={css.header} color='gray90'>Section 1</Text>
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates veritatis laborum, dolores atque, quos soluta nisi delectus placeat id dolor consectetur quas optio vero possimus quae accusamus rerum quod!
                        </section>
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates veritatis laborum, dolores atque, quos soluta nisi delectus placeat id dolor consectetur quas optio vero possimus quae accusamus rerum quod!
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates veritatis laborum, dolores atque, quos soluta nisi delectus placeat id dolor consectetur quas optio vero possimus quae accusamus rerum quod!
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates veritatis laborum, dolores atque, quos soluta nisi delectus placeat id dolor consectetur quas optio vero possimus quae accusamus rerum quod!
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates veritatis laborum, dolores atque, quos soluta nisi delectus placeat id dolor consectetur quas optio vero possimus quae accusamus rerum quod!
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates veritatis laborum, dolores atque, quos soluta nisi delectus placeat id dolor consectetur quas optio vero possimus quae accusamus rerum quod!
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates veritatis laborum, dolores atque, quos soluta nisi delectus placeat id dolor consectetur quas optio vero possimus quae accusamus rerum quod!
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates veritatis laborum, dolores atque, quos soluta nisi delectus placeat id dolor consectetur quas optio vero possimus quae accusamus rerum quod!
                        <section data-spy='b'>
                            <Text cx={css.header} color='gray90'>Section 2</Text>
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde voluptates veritatis laborum, dolores atque, quos soluta nisi delectus placeat id dolor consectetur quas optio vero possimus quae accusamus rerum quod!
                        </section>
                    </Text>
                </section>
            </FlexCell>
        </FlexRow>
    );
}