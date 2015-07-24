/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file IDataChannelListener.ts
 * @author Oleg Gordeev
 */

interface IDataChannelListener {
    recordRemoved: (id: number) => void;
    recordUpdated: (id: number) => void;
    recordCreated: (id: number, position: number) => void;
}
