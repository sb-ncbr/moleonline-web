/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import type { ColorTheme } from 'molstar/lib/mol-theme/color';
import { Color } from 'molstar/lib/mol-util/color';
import { Location } from 'molstar/lib/mol-model/location';
import { ShapeGroup } from 'molstar/lib/mol-model/shape';
import { ParamDefinition, ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { ThemeDataContext } from 'molstar/lib/mol-theme/theme';
import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories';
import { isPositionLocation } from 'molstar/lib/mol-geo/util/location-iterator';
import { ColorNames } from 'molstar/lib/mol-util/color/names';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra';
import { SizeTheme } from 'molstar/lib/mol-theme/size';
import { KDTree } from './kd-tree';
import { LayersInfo } from '../../../DataInterface';
import { ColorBound, colorTunnelNew, Property } from './property-color';

const DefaultColor = Color(0xCCCCCC);
const DescriptionColor = 'Assigns colors as defined by the shape object.';

type ColorOptions = {
    colorMaxValue: number,
    colorMinValue: number,
    layers: LayersInfo[],
    skipMiddleColors: boolean,
    colorBounds: ColorBound
}

function findClosestPoint(target: Vec3, points: Map<Vec3, { layer: LayersInfo, nextLayer: LayersInfo | undefined, distance: number }>) {
    // if (points.keys().length === 0) {
    //   throw new Error("The points array cannot be empty.");
    // }
    const pointArray = Array.from(points.keys());
    let closestPoint = pointArray[0];
    let minDistance = Vec3.distance(target, closestPoint);

    for (const point of Array.from(points.keys())) {
        const distance = Vec3.distance(target, point);
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    }

    return points.get(closestPoint);
}

export const ShapeGroupColorThemeParams = {
    tree: ParamDefinition.Value<KDTree | undefined>(undefined, { isHidden: true }),
    mappedPoints: ParamDefinition.Value<Map<Vec3, { layer: LayersInfo, nextLayer: LayersInfo | undefined, distance: number }>>(new Map(), { isHidden: true }),
    colorOptions: ParamDefinition.Value<ColorOptions | undefined>(undefined, { isHidden: true }),
    property: ParamDefinition.Value<Property | undefined>(undefined, { isHidden: true })
};
export type ShapeGroupColorThemeParams = typeof ShapeGroupColorThemeParams
export function getShapeGroupColorThemeParams(ctx: ThemeDataContext) {
    return ShapeGroupColorThemeParams; // TODO return copy
}

export function ShapeGroupColorTheme(/*ctx: ThemeDataContext,*/ props: PD.Values<ShapeGroupColorThemeParams>): ColorTheme<ShapeGroupColorThemeParams> {
    return {
        factory: ShapeGroupColorTheme,
        granularity: 'vertex',
        color: (location: Location): Color => {
            if (!isPositionLocation(location)) return ColorNames.black;
            if (props.tree && props.colorOptions && props.property) {
                const position = Vec3.toObj(location.position);
                // const node = props.tree.nearest([position.x, position.y, position.z])
                // if (node !== null) {
                //     const mappedPoint = props.mappedPoints.get(Vec3.create(node.point[0], node.point[1], node.point[2]));
                //     if (mappedPoint) {
                //         return colorTunnelNew(props.property, mappedPoint.layer, mappedPoint.nextLayer, mappedPoint.distance, props.colorOptions);
                //     }
                // }
                const node = findClosestPoint(location.position, props.mappedPoints);
                if (node) {
                    return colorTunnelNew(props.property, node.layer, node.nextLayer, node.distance, props.colorOptions);
                }
            }
            // if (!isPositionLocation(location)) return ColorNames.black;
            // if (Math.floor(Vec3.toObj(location.position).x) % 2 === 0) {
            //     return ColorNames.blue;
            // }
            // return ColorNames.red;
            // // if (ShapeGroup.isLocation(location)) {
            // //     return location.shape.getColor(location.group, location.instance);
            // // }
            return DefaultColor;
        },
        props,
        description: DescriptionColor
    };
}

export const ShapeGroupColorThemeProvider: ColorTheme.Provider<ShapeGroupColorThemeParams, 'shape-group'> = {
    name: 'shape-group',
    label: 'Shape Group',
    category: ColorThemeCategory.Misc,
    factory: ShapeGroupColorTheme,
    getParams: getShapeGroupColorThemeParams,
    defaultValues: PD.getDefaultValues(ShapeGroupColorThemeParams),
    isApplicable: (ctx: ThemeDataContext) => !!ctx.shape
};


const DefaultSize = 1;
const Description = 'Assigns sizes as defined by the shape object.';

export const ShapeGroupSizeThemeParams = {};
export type ShapeGroupSizeThemeParams = typeof ShapeGroupSizeThemeParams
export function getShapeGroupSizeThemeParams(ctx: ThemeDataContext) {
    return ShapeGroupSizeThemeParams; // TODO return copy
}

export function ShapeGroupSizeTheme(/*ctx: ThemeDataContext,*/ props: PD.Values<ShapeGroupSizeThemeParams>): SizeTheme<ShapeGroupSizeThemeParams> {
    return {
        factory: ShapeGroupSizeTheme,
        granularity: 'groupInstance',
        size: (location: Location): number => {
            if (ShapeGroup.isLocation(location)) {
                return location.shape.getSize(location.group, location.instance);
            }
            return DefaultSize;
        },
        props,
        description: Description
    };
}

export const ShapeGroupSizeThemeProvider: SizeTheme.Provider<ShapeGroupSizeThemeParams, 'shape-group'> = {
    name: 'shape-group',
    label: 'Shape Group',
    category: '',
    factory: ShapeGroupSizeTheme,
    getParams: getShapeGroupSizeThemeParams,
    defaultValues: PD.getDefaultValues(ShapeGroupSizeThemeParams),
    isApplicable: (ctx: ThemeDataContext) => !!ctx.shape
};