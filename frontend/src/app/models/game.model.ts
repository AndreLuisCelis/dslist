export interface GameMinDto {
  id: number;
  title: string;
  year: number;
  imgUrl: string;
  shortDescription: string;
}

export interface GameDto {
  id: number;
  title: string;
  year: number;
  genre: string;
  platforms: string;
  score: number;
  imgUrl: string;
  shortDescription: string;
  longDescription: string;
}
