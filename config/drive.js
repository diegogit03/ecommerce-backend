'use strict'

const Helpers = use('Helpers')
const Env = use('Env')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default disk
  |--------------------------------------------------------------------------
  |
  | The default disk is used when you interact with the file system without
  | defining a disk name
  |
  */
  default: Env.getOrFail('DRIVE_DISK'),

  disks: {
    /*
    |--------------------------------------------------------------------------
    | Local
    |--------------------------------------------------------------------------
    |
    | Local disk interacts with the a local folder inside your application
    |
    */
    local: {
      root: Helpers.publicPath('uploads'),
      driver: 'local'
    },

    /*
    |--------------------------------------------------------------------------
    | S3
    |--------------------------------------------------------------------------
    |
    | S3 disk interacts with a bucket on aws s3
    |
    */
    s3: {
      driver: 's3',
      key: Env.getOrFail('S3_KEY'),
      secret: Env.getOrFail('S3_SECRET'),
      bucket: Env.getOrFail('S3_BUCKET'),
      region: Env.getOrFail('S3_REGION')
    }
  }
}
