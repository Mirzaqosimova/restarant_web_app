import path from 'path';
import { ApiResponse } from '../shared/response/base.response';
const fs = require('fs');

export class MediasService {
  private static instance = new MediasService();

  public static getInstance() {
    return this.instance;
  }

  create(req, res) {
    if (req.file.filename) {
      return res.json(ApiResponse.Success({ fileName: req.file.name }));
    }
    return res.json(
      ApiResponse.Conflict('Oops something went wrong please try again'),
    );
  }

  async delete(req, res) {
    const drname =
      path.join(__dirname, '..', '..', 'assets') + `/${req.fileName}`;
    console.log(drname);

    await fs.unlink(drname, function (err) {
      if (err) return res.json(ApiResponse.Conflict('I think file not found'));
      return res.json(ApiResponse.Success('deleted!'));
    });
  }
}
