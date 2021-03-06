/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file IDataChannelFactory.ts
 * @author Oleg Gordeev
 */

interface IDataChannelFactory {
    subscribe: (listener: IDataChannelListener) => IDataChannel;
    unsubscribe: (channel: IDataChannel) => void;
}