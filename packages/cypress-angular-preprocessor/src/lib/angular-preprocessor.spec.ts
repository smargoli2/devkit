import { angularPreprocessor } from './angular-preprocessor';
import * as webpackPreprocessor from '@cypress/webpack-preprocessor';
import { AngularCompilerPlugin } from '@ngtools/webpack';

jest.mock('@cypress/webpack-preprocessor');
jest.mock('@ngtools/webpack');

describe('preprocessor', () => {
  const mockWebpackPreprocessor = webpackPreprocessor as jest.MockedFunction<
    typeof webpackPreprocessor
  >;
  const mockAngularCompilerPlugin = AngularCompilerPlugin as jest.MockedClass<
    typeof AngularCompilerPlugin
  >;

  beforeEach(() => mockAngularCompilerPlugin.mockReset());
  beforeEach(() => mockWebpackPreprocessor.mockReset());

  it('should return webpack config', () => {
    const filePreprocessor = jest.fn();
    mockWebpackPreprocessor.mockReturnValue(filePreprocessor);

    /* Preprocessor should return the file preprocessor returned by webpack preprocessor. */
    expect(
      angularPreprocessor({
        env: {
          tsConfig: '/packages/lib-e2e/tsconfig.e2e.json',
        },
      })
    ).toEqual(filePreprocessor);

    expect(webpackPreprocessor).toBeCalledTimes(1);
    expect(webpackPreprocessor).toBeCalledWith({
      webpackOptions: {
        plugins: [expect.any(AngularCompilerPlugin)],
        resolve: {
          extensions: ['.js', '.ts'],
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              loader: '@ngtools/webpack',
            },
            {
              test: /\.css$/,
              loader: 'raw-loader',
            },
            {
              test: /\.scss$/,
              use: ['raw-loader', 'sass-loader'],
            },
          ],
        },
      },
    });
  });

  it('should create angular compiler with the right options', () => {
    angularPreprocessor({
      env: {
        tsConfig: '/packages/lib-e2e/tsconfig.e2e.json',
      },
    });

    expect(mockAngularCompilerPlugin).toBeCalledTimes(1);
    expect(mockAngularCompilerPlugin).toBeCalledWith({
      directTemplateLoading: true,
      sourceMap: true,
      tsConfigPath: '/packages/lib-e2e/tsconfig.e2e.json',
    });
  });

  it('should extend angular compiler options', () => {
    angularPreprocessor(
      {
        env: {
          tsConfig: '/packages/lib-e2e/tsconfig.e2e.json',
        },
      },
      {
        angularCompilerOptions: {
          directTemplateLoading: false,
        },
      }
    );

    expect(mockAngularCompilerPlugin).toBeCalledTimes(1);
    expect(mockAngularCompilerPlugin).toBeCalledWith(
      expect.objectContaining({
        directTemplateLoading: false,
        sourceMap: true,
      })
    );
  });
});
